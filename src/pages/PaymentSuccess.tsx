import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaDownload, FaSpinner } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import { useCommissionSeller, useEvent } from "../hooks/useApi";
import { verifyPayment } from "../services/payment";
import { getTicketByTxRef, saveTicket, updateTicket } from "../services/ticket";
import { sendWhatsAppThankYou } from "../services/whatsapp";
import { BRAND, GRADIENT } from "../styles/theme";
import { logger } from "../utils/logger";

import QRCode from "react-qr-code";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get("tx_ref");
  const quantityParam = searchParams.get("quantity");
  const eventIdParam = searchParams.get("event_id");
  const eventTitleParam = searchParams.get("event_title");
  const commissionSellerIdParam = searchParams.get("commission_seller_id");
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "failed" | "pending">("loading");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [ticketSaved, setTicketSaved] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  
  // Fetch event details for the background image
  const { event } = useEvent(eventIdParam || undefined);
  
  // Use cached hook for commission seller
  const validCommissionSellerId = commissionSellerIdParam && commissionSellerIdParam.trim() !== '' 
    ? commissionSellerIdParam.trim() 
    : undefined;
  const { seller: commissionSeller } = useCommissionSeller(validCommissionSellerId);

  // Function to save ticket to database
  const saveTicketToDatabase = useCallback(async (paymentData: any, txRef: string | null) => {
    if (!txRef || ticketSaved) return; // Don't save twice

    try {
      // Get amount value
      // Chapa may return amounts in cents or base currency depending on the API version
      // We need to detect which format it is:
      // - If amount is very large (>= 1000) and has no decimal or is integer, it's likely in cents
      // - If amount has decimal places or is reasonable (< 10000), it's likely in base currency
      let amount = 0;
      if (paymentData.amount) {
        if (typeof paymentData.amount === 'string') {
          const parsed = parseFloat(paymentData.amount);
          // Check if it looks like cents: very large number (>= 1000) and no meaningful decimal part
          const isLikelyCents = parsed >= 1000 && (parsed % 1 === 0 || parsed % 100 === 0);
          if (isLikelyCents) {
            // Likely in cents, divide by 100
            amount = parsed / 100;
          } else {
            // Already in base currency, use as is
            amount = parsed;
          }
        } else {
          // For numeric values, apply same logic
          const isLikelyCents = paymentData.amount >= 1000 && (paymentData.amount % 1 === 0 || paymentData.amount % 100 === 0);
          if (isLikelyCents) {
            amount = paymentData.amount / 100;
          } else {
            amount = paymentData.amount;
          }
        }
      }

      // Get customer name
      const customerName = paymentData.first_name && paymentData.last_name
        ? `${paymentData.first_name} ${paymentData.last_name}`
        : paymentData.first_name || paymentData.last_name || '';

      // Get quantity from URL params
      let quantity = 1;
      if (quantityParam) {
        const qty = parseInt(quantityParam, 10);
        if (!isNaN(qty) && qty > 0) {
          quantity = qty;
        } else {
          logger.warn('⚠️ Invalid quantity param:', quantityParam, 'defaulting to 1');
        }
      } else {
        logger.warn('⚠️ No quantity param in URL, defaulting to 1');
      }
      
      logger.log('Quantity info:', { 
        quantityParam, 
        parsedQuantity: quantity, 
        amount,
        commission_seller_id_param: commissionSellerIdParam
      });

      // Prepare QR code data
      const qrData = {
        tx_ref: paymentData.tx_ref || txRef || "",
        amount: amount,
        currency: paymentData.currency || "ETB",
        date: paymentData.created_at || new Date().toISOString(),
        status: paymentData.status || "success",
        reference: paymentData.reference || paymentData.tx_ref || txRef || "",
        quantity: quantity,
        email: paymentData.email || "",
        name: customerName
      };

      // Get commission seller name from cached hook data
      const commissionSellerName = commissionSeller?.name;
      if (validCommissionSellerId && commissionSellerName) {
        logger.log('Commission seller found:', { id: validCommissionSellerId, name: commissionSellerName });
      }

      // Check if ticket already exists - if so, update it with commission_seller_id and quantity
      const existingTicket = await getTicketByTxRef(txRef);
      if (existingTicket) {
        logger.log('Ticket already exists in database, checking if update is needed');
        
        // Update existing ticket with commission_seller_id and quantity if they're missing or different
        const commissionSellerChanged = validCommissionSellerId !== undefined && 
          existingTicket.commission_seller_id !== validCommissionSellerId;
        const quantityChanged = quantity !== undefined && 
          existingTicket.quantity !== quantity;
        const needsUpdate = commissionSellerChanged || quantityChanged;
        
        if (needsUpdate) {
          logger.log('Updating ticket with:', {
            commission_seller_id: validCommissionSellerId,
            quantity: quantity,
            existing_commission_seller_id: existingTicket.commission_seller_id,
            existing_quantity: existingTicket.quantity,
          });
          
          await updateTicket(txRef, {
            commission_seller_id: validCommissionSellerId,
            commission_seller_name: commissionSellerName,
            quantity: quantity,
            qr_code_data: qrData,
          });
          logger.log('Ticket updated successfully with commission_seller_id and quantity');
        } else {
          logger.log('Ticket already has correct commission_seller_id and quantity');
        }
        
        setTicketSaved(true);
        return;
      }

      // Save ticket with quantity
      logger.log('Saving ticket with data:', { 
        tx_ref: txRef, 
        amount, 
        quantity,
        commission_seller_id: validCommissionSellerId,
        commission_seller_name: commissionSellerName
      });

      await saveTicket({
        tx_ref: txRef,
        event_id: eventIdParam || undefined,
        event_title: eventTitleParam || undefined,
        customer_name: customerName || undefined,
        customer_email: paymentData.email || '',
        customer_phone: paymentData.phone_number || undefined,
        amount: amount,
        currency: paymentData.currency || 'ETB',
        quantity: quantity, // This should be the actual quantity purchased
        status: 'success',
        chapa_reference: paymentData.reference || undefined,
        commission_seller_id: validCommissionSellerId,
        commission_seller_name: commissionSellerName,
        qr_code_data: qrData,
        payment_date: paymentData.created_at || new Date().toISOString(),
      });

      logger.log('Ticket saved to database successfully');
      setTicketSaved(true);
    } catch (error: any) {
      console.error('Error saving ticket to database:', error);
      // Don't show error to user, ticket display will still work
    }
  }, [quantityParam, eventIdParam, eventTitleParam, commissionSellerIdParam, ticketSaved, commissionSeller, validCommissionSellerId]);

  // Function to send WhatsApp thank you message
  const sendWhatsAppMessage = useCallback(async (paymentData: any, txRef: string | null) => {
    if (!txRef || whatsappSent || !paymentData.phone_number) return; // Don't send twice or if no phone number

    try {
      // Get amount value
      let amount = 0;
      if (paymentData.amount) {
        if (typeof paymentData.amount === 'string') {
          const parsed = parseFloat(paymentData.amount);
          if (parsed >= 100) {
            amount = parsed / 100;
          } else {
            amount = parsed;
          }
        } else {
          if (paymentData.amount >= 100) {
            amount = paymentData.amount / 100;
          } else {
            amount = paymentData.amount;
          }
        }
      }

      // Get customer name
      const customerName = paymentData.first_name && paymentData.last_name
        ? `${paymentData.first_name} ${paymentData.last_name}`
        : paymentData.first_name || paymentData.last_name || '';

      // Get quantity
      let quantity = 1;
      if (quantityParam) {
        const qty = parseInt(quantityParam, 10);
        if (!isNaN(qty) && qty > 0) quantity = qty;
      }

      // Send WhatsApp message
      const result = await sendWhatsAppThankYou({
        phone_number: paymentData.phone_number,
        customer_name: customerName || undefined,
        amount: amount,
        currency: paymentData.currency || 'ETB',
        tx_ref: txRef,
        event_title: eventTitleParam || undefined,
        quantity: quantity,
      });

      if (result.success) {
        logger.log('✅ WhatsApp thank you message sent successfully');
        setWhatsappSent(true);
      } else {
        logger.warn('⚠️  Failed to send WhatsApp message:', result.error);
        // Don't show error to user, it's not critical
      }
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      // Don't show error to user, it's not critical
    }
  }, [quantityParam, eventTitleParam, whatsappSent]);

  useEffect(() => {
    const verify = async (attempt: number = 0) => {
      if (!txRef) {
        setVerificationStatus("failed");
        return;
      }

      // Handle free registration bypass
      if (txRef.startsWith("free_reg_")) {
        logger.log("Free registration detected, bypassing Chapa verification");
        const firstName = searchParams.get("first_name") || "Guest";
        const lastName = searchParams.get("last_name") || "";
        const email = searchParams.get("email") || "";
        const phone = searchParams.get("phone") || "";
        // const quantity = parseInt(searchParams.get("quantity") || "1", 10);
        
        const mockPaymentData = {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone_number: phone,
          amount: 0,
          currency: "ETB",
          status: "success",
          created_at: new Date().toISOString(),
          tx_ref: txRef
        };
        
        setPaymentData(mockPaymentData);
        setVerificationStatus("success");
        saveTicketToDatabase(mockPaymentData, txRef);
        // Note: WhatsApp message for free reg is handled by the registration hook, but we can send a backup here too if needed
        return;
      }

      try {
        const response = await verifyPayment(txRef);
        logger.log("Verification response (attempt " + (attempt + 1) + ")");
        
        if (response.success && response.data) {
          setPaymentData(response.data);
          // Check various possible status values
          const status = response.data.status?.toLowerCase();
          if (status === "success" || status === "successful" || status === "completed") {
            setVerificationStatus("success");
            // Save ticket to database
            saveTicketToDatabase(response.data, txRef);
            // Send WhatsApp thank you message (backend also sends it, but this is a backup)
            sendWhatsAppMessage(response.data, txRef);
          } else if (status === "failed" || status === "cancelled" || status === "canceled") {
            setVerificationStatus("failed");
          } else if (status === "pending" || status === "processing") {
            // Retry for pending payments (up to 3 times with delay)
            if (attempt < 3) {
              logger.log(`Payment is pending, retrying in ${(attempt + 1) * 2} seconds...`);
              setTimeout(() => {
                setRetryCount(attempt + 1);
                verify(attempt + 1);
              }, (attempt + 1) * 2000); // 2s, 4s, 6s delays
              setVerificationStatus("pending");
            } else {
              logger.warn("Payment still pending after retries");
              setVerificationStatus("failed");
            }
          } else {
            // Unknown status - show the data but mark as failed
            logger.warn("Unknown payment status:", status);
            setVerificationStatus("failed");
          }
        } else {
          // If verification fails but we have a tx_ref, it might be pending
          if (attempt < 2) {
            logger.log("Verification failed, retrying...");
            setTimeout(() => {
              setRetryCount(attempt + 1);
              verify(attempt + 1);
            }, 3000);
            setVerificationStatus("pending");
          } else {
            console.error("Verification failed - no data in response:", response);
            setVerificationStatus("failed");
          }
        }
      } catch (error: any) {
        console.error("Verification error (attempt " + (attempt + 1) + "):", error);
        console.error("Error details:", error.message, error.error, error.details);
        
        // Retry on network errors
        if (attempt < 2 && (error.message?.includes('network') || error.message?.includes('fetch'))) {
          setTimeout(() => {
            setRetryCount(attempt + 1);
            verify(attempt + 1);
          }, 3000);
          setVerificationStatus("pending");
        } else {
          setVerificationStatus("failed");
        }
      }
    };

    verify();
  }, [txRef, retryCount, saveTicketToDatabase, sendWhatsAppMessage, searchParams]);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString();
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get short transaction reference (first 6 chars)
  const getShortTxRef = (ref?: string) => {
    if (!ref) return "N/A";
    return ref.substring(0, 6).toUpperCase();
  };

  // Get ticket quantity - from URL param or calculate from amount/price, default to 1
  const ticketQuantity = useMemo(() => {
    if (quantityParam) {
      const qty = parseInt(quantityParam, 10);
      if (!isNaN(qty) && qty > 0) return qty;
    }
    // If no quantity param, try to calculate from amount
    // For now, default to 1 (can be enhanced later with event price info)
    return 1;
  }, [quantityParam]);

  // Generate QR code data with payment information including quantity
  const qrCodeData = useMemo(() => {
    if (!paymentData) return "";
    
    const qrData = {
      tx_ref: paymentData.tx_ref || txRef || "",
      amount: paymentData.amount ? (() => {
        const amt = typeof paymentData.amount === 'string' ? parseFloat(paymentData.amount) : paymentData.amount;
        // Only divide by 100 if amount is >= 100 (likely in cents)
        return amt >= 100 ? amt / 100 : amt;
      })() : 0,
      currency: paymentData.currency || "ETB",
      date: paymentData.created_at || new Date().toISOString(),
      status: paymentData.status || "success",
      reference: paymentData.reference || paymentData.tx_ref || txRef || "",
      quantity: ticketQuantity,
      email: paymentData.email || "",
      name: paymentData.first_name && paymentData.last_name 
        ? `${paymentData.first_name} ${paymentData.last_name}` 
        : paymentData.first_name || paymentData.last_name || ""
    };
    
    return JSON.stringify(qrData);
  }, [paymentData, txRef, ticketQuantity]);

  return (
    <div className="payment-success-container" style={{ minHeight: "100vh", background: BRAND.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap');

        .yg-font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .yg-font-sans  { font-family: 'Manrope', system-ui, sans-serif; }

        .payment-success-body {
          padding-top: 100px;
          padding-bottom: 100px;
        }

        .premium-ticket {
          background: #FFFFFF;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 40px 100px -20px rgba(15, 23, 42, 0.15);
          border: 1px solid rgba(15, 23, 42, 0.05);
          position: relative;
        }

        .ticket-divider {
          border-right: 2px dashed rgba(15, 23, 42, 0.1);
          position: relative;
        }
        .ticket-divider::before, .ticket-divider::after {
          content: '';
          position: absolute;
          width: 30px;
          height: 30px;
          background: ${BRAND.cream};
          border-radius: 50%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }
        .ticket-divider::before { top: -15px; }
        .ticket-divider::after { bottom: -15px; }

        .yg-btn-download {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          border-radius: 999px;
          background: ${GRADIENT.brand};
          color: ${BRAND.navy};
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: transform 0.25s, box-shadow 0.25s;
          box-shadow: 0 8px 30px rgba(255,111,94,0.3);
        }
        .yg-btn-download:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(255,111,94,0.4);
        }

        .yg-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          border-radius: 999px;
          background: #FFFFFF;
          color: ${BRAND.navy};
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid rgba(15, 23, 42, 0.1);
          transition: all 0.3s;
        }
        .yg-btn-secondary:hover {
          background: #F8F9FA;
          border-color: ${BRAND.navy};
        }

        @media (max-width: 768px) {
          .ticket-grid { grid-template-columns: 1fr !important; }
          .ticket-divider {
            border-right: none !important;
            border-bottom: 2px dashed rgba(15, 23, 42, 0.1) !important;
            height: 2px;
            width: 100%;
            margin: 40px 0;
          }
          .ticket-divider::before { left: -15px; top: 50%; transform: translateY(-50%); }
          .ticket-divider::after { right: -15px; left: auto; top: 50%; transform: translateY(-50%); }
        }
      `}</style>

      {(verificationStatus === "loading" || verificationStatus === "pending") && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <FaSpinner className="mx-auto text-5xl text-[#FFD447] animate-spin mb-8" />
            <h1 className="yg-font-serif text-3xl font-black text-[#0F172A] mb-4">
              {verificationStatus === "pending" ? "Almost There..." : "Verifying Payment"}
            </h1>
            <p className="yg-font-sans text-gray-500 tracking-wide">
              {verificationStatus === "pending" 
                ? `Securing your transaction${retryCount > 0 ? ` (attempt ${retryCount + 1})` : ''}...`
                : "Please wait while we finalize your experience."}
            </p>
          </div>
        </div>
      )}

      {verificationStatus === "success" && (
        <div className="payment-success-body flex flex-col items-center">
          <div className="w-full max-w-5xl px-4 flex justify-end mb-8">
            <button
              onClick={async (e) => {
                if (!ticketRef.current || isDownloading) return;
                setIsDownloading(true);
                try {
                  console.log('Starting ticket download process...');
                  // Scroll to top to ensure html2canvas captures correctly without offset issues
                  window.scrollTo(0, 0);
                  
                  const html2canvas = (await import('html2canvas')).default;
                  console.log('html2canvas imported');
                  
                  const canvas = await html2canvas(ticketRef.current, {
                    backgroundColor: '#0F172A',
                    scale: 2,
                    logging: true,
                    useCORS: true,
                    allowTaint: false,
                    onclone: (clonedDoc) => {
                      // Fix for html2canvas not supporting backdrop-filter
                      const glassElements = clonedDoc.querySelectorAll('.backdrop-blur-xl') as NodeListOf<HTMLElement>;
                      glassElements.forEach(el => {
                        el.style.backdropFilter = 'none';
                        el.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; // Solid fallback for capture
                      });
                      
                      const ticketVisual = clonedDoc.querySelector('.aspect-\\[1\\/1\\.6\\]') as HTMLElement;
                      if (ticketVisual) {
                        ticketVisual.style.display = 'flex';
                        ticketVisual.style.flexDirection = 'column';
                      }
                    }
                  });
                  
                  console.log('Canvas generated, converting to blob...');
                  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                  
                  if (!blob) throw new Error('Canvas conversion failed');
                  
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.download = `YENEGE-Ticket-${getShortTxRef(paymentData?.tx_ref || txRef)}.png`;
                  link.href = url;
                  document.body.appendChild(link);
                  link.click();
                  
                  // Cleanup
                  setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }, 100);
                } catch (error) {
                  console.error('Error downloading ticket:', error);
                  alert('There was an issue generating your ticket image. Please try again or take a screenshot of this page.');
                } finally {
                  setIsDownloading(false);
                }
              }}
              disabled={isDownloading}
              className="yg-btn-download"
            >
              <FaDownload />
              {isDownloading ? "Generating..." : "Download Digital Ticket"}
            </button>
          </div>

          {/* Ticket Visual - Ultra-Minimal Full-Image Pass */}
          <div ref={ticketRef} className="w-full max-w-[400px] mx-auto overflow-hidden p-4 bg-[#0F172A]">
            <div className="relative aspect-[1/1.6] bg-black rounded-[40px] shadow-2xl overflow-hidden flex flex-col text-white font-sans">
              
              {/* Full Bleed Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={event?.image || (event?.gallery && event.gallery[0]) || "/logo.png"} 
                  alt="Background" 
                  className="w-full h-full object-cover opacity-60" 
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/90" />
              </div>

              {/* Content Overlay */}
              <div className="relative h-full flex flex-col p-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-auto">
                  <img src="/logo.png" alt="YENEGE" className="h-8 w-auto brightness-0 invert" crossOrigin="anonymous" />
                  <div className="text-right">
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50">Curation Pass</p>
                    <p className="text-[9px] font-bold tracking-widest text-[#FFD447]">#{getShortTxRef(paymentData?.tx_ref || txRef)}</p>
                  </div>
                </div>

                {/* Center Piece */}
                <div className="mb-10">
                  <h1 className="yg-font-serif text-5xl font-black leading-[1.1] mb-4 tracking-tight">
                    {eventTitleParam || event?.title || "Exclusive"}
                  </h1>
                  <div className="h-1 w-12 bg-[#FFD447]" />
                </div>

                {/* Details Grid - Glassmorphism style */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 space-y-6 mb-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Identity</p>
                      <p className="text-sm font-black truncate">
                        {paymentData?.first_name || searchParams.get("first_name")}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Temporal</p>
                      <p className="text-sm font-black">
                        {paymentData ? formatDate(paymentData.created_at) : formatDate()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Admissions</p>
                      <p className="text-sm font-black">{ticketQuantity} Tickets</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Status</p>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Confirmed</p>
                    </div>
                  </div>
                </div>

                {/* QR Section */}
                <div className="flex items-center justify-between gap-8 pt-4">
                  <div className="flex-1">
                     <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30 mb-2">Secure Entry QR</p>
                     <p className="text-[9px] text-white/40 leading-relaxed font-medium">
                       Validated on YENEGE Protocol.<br/>Presented at the main curation entrance.
                     </p>
                  </div>
                  <div className="p-3 bg-white rounded-2xl shadow-xl">
                    {qrCodeData && (
                      <QRCode
                        value={qrCodeData}
                        size={80}
                        level="M"
                        fgColor="#000000"
                        bgColor="#FFFFFF"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Security Strip */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFD447] to-transparent opacity-50" />
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-6 text-center">
            <p className="yg-font-sans text-sm text-gray-500 max-w-md">
              Thank you for choosing YENEGE. A confirmation email has been sent to your inbox.
            </p>
            <div className="flex gap-4">
              <Link to="/events" className="yg-btn-secondary">Back to Events</Link>
              <Link to="/" className="yg-btn-secondary">Home</Link>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === "failed" && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">✕</span>
            </div>
            <h1 className="yg-font-serif text-3xl font-black text-[#0F172A] mb-4">Verification Failed</h1>
            <p className="yg-font-sans text-gray-500 mb-10">
              We couldn't confirm your payment status. Please contact support with your reference number.
            </p>
            
            {txRef && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-10 text-left border border-gray-100">
                <p className="yg-font-sans text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Reference ID</p>
                <p className="yg-font-sans text-xs font-mono font-bold text-[#0F172A] break-all">{txRef}</p>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="yg-btn-download w-full justify-center"
              >
                Retry Verification
              </button>
              <Link to="/contact" className="yg-btn-secondary w-full justify-center">Contact Support</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;

