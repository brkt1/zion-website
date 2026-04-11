import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaCheckCircle, FaDownload, FaSpinner } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import { useCommissionSeller } from "../hooks/useApi";
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
        const quantity = parseInt(searchParams.get("quantity") || "1", 10);
        
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
  }, [txRef, retryCount, saveTicketToDatabase, sendWhatsAppMessage]);

  // Format amount for display
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString();
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Get short transaction reference (first 6 chars)
  const getShortTxRef = (ref?: string) => {
    if (!ref) return "N/A";
    return ref.substring(0, 6).toUpperCase();
  };


  // Get amount value - handle both string and number formats
  // Chapa may return amounts in cents or base currency depending on the API version
  const getAmount = () => {
    if (!paymentData || !paymentData.amount) return 0;
    
    let amountValue = 0;
    if (typeof paymentData.amount === 'string') {
      amountValue = parseFloat(paymentData.amount);
    } else {
      amountValue = paymentData.amount;
    }
    
    // Check if it looks like cents: very large number (>= 1000) and no meaningful decimal part
    const isLikelyCents = amountValue >= 1000 && (amountValue % 1 === 0 || amountValue % 100 === 0);
    if (isLikelyCents) {
      // Likely in cents, divide by 100
      return amountValue / 100;
    } else {
      // Already in base currency, use as is
      return amountValue;
    }
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
            <h1 className="yg-font-serif text-3xl font-black text-[#01211C] mb-4">
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
                    backgroundColor: '#FFFFFF',
                    scale: 1.5,
                    logging: true,
                    useCORS: true,
                    allowTaint: false,
                    onclone: (clonedDoc) => {
                      // Ensure everything is static and visible
                      const svgs = clonedDoc.querySelectorAll('svg');
                      svgs.forEach(svg => {
                        svg.setAttribute('focusable', 'false');
                        svg.setAttribute('aria-hidden', 'true');
                      });
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

          <div ref={ticketRef} className="w-full max-w-5xl px-4">
            <div className="premium-ticket ticket-grid grid grid-cols-[1.5fr_1fr] bg-white">
              {/* Main Ticket Area */}
              <div className="p-10 md:p-14 relative">
                {/* Logo & Header */}
                <div className="flex justify-between items-start mb-14">
                  <div>
                    <img 
                      src="/logo.png" 
                      alt="YENEGE" 
                      className="h-16 w-auto mb-6" 
                      crossOrigin="anonymous"
                      loading="eager"
                    />
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest border border-green-100">
                      <FaCheckCircle size={10} /> Confirmed
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="yg-font-serif text-4xl font-black text-[#0F172A] mb-1">Receipt</h2>
                    <p className="yg-font-sans text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Transaction Verified</p>
                  </div>
                </div>

                {/* Event Details */}
                <div className="mb-14">
                  <h3 className="yg-font-sans text-[10px] font-extrabold text-[#FF6F5E] uppercase tracking-[0.3em] mb-4">Event Details</h3>
                  <h1 className="yg-font-serif text-3xl md:text-4xl font-black text-[#0F172A] mb-8 leading-tight">
                    {eventTitleParam || "Official Event"}
                  </h1>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                      <p className="yg-font-sans text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                      <p className="yg-font-sans text-sm font-bold text-[#0F172A]">{paymentData ? formatDate(paymentData.created_at) : formatDate()}</p>
                    </div>
                    <div>
                      <p className="yg-font-sans text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Time</p>
                      <p className="yg-font-sans text-sm font-bold text-[#0F172A]">{paymentData ? formatTime(paymentData.created_at) : formatTime()}</p>
                    </div>
                    <div>
                      <p className="yg-font-sans text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Quantity</p>
                      <p className="yg-font-sans text-sm font-bold text-[#0F172A]">{ticketQuantity} Tickets</p>
                    </div>
                    <div>
                      <p className="yg-font-sans text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                      <p className="yg-font-sans text-sm font-bold text-[#0F172A]">{paymentData ? `${formatAmount(getAmount())} ${paymentData.currency || 'ETB'}` : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="pt-10 border-t border-gray-100">
                  <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                    <div>
                      <p className="yg-font-sans text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                      <p className="yg-font-sans text-xs font-bold text-[#0F172A]">
                        {paymentData?.first_name || ""} {paymentData?.last_name || ""}
                      </p>
                    </div>
                    <div>
                      <p className="yg-font-sans text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reference</p>
                      <p className="yg-font-sans text-[10px] font-bold text-gray-400 tracking-wider">
                        {paymentData?.tx_ref || txRef}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#E4E821]/10 to-transparent rounded-bl-full pointer-events-none" />
              </div>

              {/* Stub / QR Section */}
              <div className="ticket-divider" />
              <div className="bg-[#01211C] p-10 md:p-14 flex flex-col items-center justify-center text-center">
                <div className="mb-10 text-white">
                  <h3 className="yg-font-serif text-3xl font-black mb-2">Ticket</h3>
                  <div className="h-1 w-12 bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] mx-auto rounded-full" />
                </div>

                {/* QR Code Container */}
                <div className="p-6 bg-white rounded-3xl mb-10 shadow-2xl">
                  {qrCodeData && (
                    <QRCode
                      value={qrCodeData}
                      size={170}
                      level="Q"
                      fgColor="#01211C"
                      bgColor="#FFFFFF"
                      className="max-w-full h-auto"
                    />
                  )}
                </div>

                <div className="text-white space-y-2">
                  <p className="yg-font-sans text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Ticket Number</p>
                  <p className="yg-font-serif text-2xl font-black text-[#FFD447] tracking-wider">
                    {getShortTxRef(paymentData?.tx_ref || txRef)}
                  </p>
                </div>

                <p className="mt-10 yg-font-sans text-[9px] text-gray-500 max-w-[200px] leading-relaxed">
                  Present this QR code at the entrance for verification. Valid for {ticketQuantity} entries.
                </p>
              </div>
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

