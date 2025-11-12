import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaCheckCircle, FaDownload, FaSpinner } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import { verifyPayment } from "../services/payment";
import { getTicketByTxRef, saveTicket, updateTicket } from "../services/ticket";
import { sendWhatsAppThankYou } from "../services/whatsapp";
import { logger } from "../utils/logger";

// Lazy load QRCode component to reduce initial bundle size (only needed after payment)
const QRCode = lazy(() => import("react-qr-code").then(module => ({ default: module.default })));

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

      // Get commission seller name if commission_seller_id is provided
      // Handle empty strings - treat them as undefined
      const validCommissionSellerId = commissionSellerIdParam && commissionSellerIdParam.trim() !== '' 
        ? commissionSellerIdParam.trim() 
        : undefined;
      
      let commissionSellerName: string | undefined = undefined;
      if (validCommissionSellerId) {
        try {
          const seller = await adminApi.commissionSellers.getById(validCommissionSellerId);
          commissionSellerName = seller.name;
          logger.log('Commission seller found:', { id: validCommissionSellerId, name: commissionSellerName });
        } catch (error) {
          console.error('Error fetching commission seller:', error);
          // Continue without seller name
        }
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
  }, [quantityParam, eventIdParam, eventTitleParam, commissionSellerIdParam, ticketSaved]);

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
    <div className="payment-success-container">
      {(verificationStatus === "loading" || verificationStatus === "pending") && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <FaSpinner className="mx-auto text-5xl text-amber-600 animate-spin mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {verificationStatus === "pending" ? "Payment Processing..." : "Verifying Payment..."}
            </h1>
            <p className="text-gray-600">
              {verificationStatus === "pending" 
                ? `Please wait while we check your payment status${retryCount > 0 ? ` (attempt ${retryCount + 1})` : ''}...`
                : "Please wait while we verify your payment."}
            </p>
            {txRef && (
              <p className="text-sm text-gray-500 mt-2 font-mono">{txRef}</p>
            )}
          </div>
        </div>
      )}

      {verificationStatus === "success" && (
        <div className="bg-white flex flex-col justify-center items-center min-h-screen px-4 py-8 payment-success-body">
          {/* Download Button */}
          <div className="w-full max-w-sm sm:max-w-4xl mb-6 flex justify-end">
            <button
              onClick={async () => {
                if (!ticketRef.current || isDownloading) return;
                setIsDownloading(true);
                try {
                  // Lazy load html2canvas only when needed to reduce initial bundle size
                  const html2canvas = (await import('html2canvas')).default;
                  const canvas = await html2canvas(ticketRef.current, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false,
                    useCORS: true,
                  });
                  const link = document.createElement('a');
                  link.download = `ticket-${getShortTxRef(paymentData?.tx_ref || txRef)}-${Date.now()}.png`;
                  link.href = canvas.toDataURL('image/png');
                  link.click();
                } catch (error) {
                  console.error('Error downloading ticket:', error);
                  alert('Failed to download ticket. Please try again.');
                } finally {
                  setIsDownloading(false);
                }
              }}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <FaDownload className={isDownloading ? "animate-bounce" : ""} />
              {isDownloading ? "Downloading..." : "Download Ticket"}
            </button>
          </div>

          <main ref={ticketRef} className="text-gray-400 font-thin w-full max-w-sm sm:max-w-4xl grid sm:grid-cols-[4fr_1fr] payment-success-main bg-white">
            {/* boarding pass */}
            <div className="py-6 px-6 sm:px-10 space-y-6 sm:space-y-12 relative payment-success-pass">
              <section className="w-full grid grid-cols-3 gap-x-4 sm:px-8 isolate overflow-hidden payment-success-header">
                <h2 className="animate-in" style={{ "--d": "500ms" } as React.CSSProperties}>PAY</h2>
                <div>
                  <span id="plane-1" style={{ "--d": "2000ms" } as React.CSSProperties} className="payment-icon">
                    <FaCheckCircle className="text-cyan-400" />
                  </span>
                </div>
                <h2 className="animate-in" style={{ "--d": "1000ms" } as React.CSSProperties}>SUCCESS</h2>
                <p className="animate-in" style={{ "--d": "500ms" } as React.CSSProperties}>Payment</p>
                <span></span>
                <p className="animate-in" style={{ "--d": "1000ms" } as React.CSSProperties}>Confirmed</p>
              </section>

              <section className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-3 px-6 bg-cyan-100 font-thin whitespace-nowrap text-sm sm:text-base payment-success-details">
                <div className="animate-in-X" style={{ "--d": "1200ms" } as React.CSSProperties}>
                  <h3>Amount</h3>
                  <time>{paymentData ? `${formatAmount(getAmount())} ${paymentData.currency || 'ETB'}` : 'N/A'}</time>
                </div>
                <div className="animate-in-X" style={{ "--d": "1500ms" } as React.CSSProperties}>
                  <h3>Date</h3>
                  <time>{paymentData ? formatDate(paymentData.created_at) : formatDate()}</time>
                </div>
                <div className="animate-in-X" style={{ "--d": "1800ms" } as React.CSSProperties}>
                  <h3>Time</h3>
                  <time>{paymentData ? formatTime(paymentData.created_at) : formatTime()}</time>
                </div>
                <div className="animate-in-X" style={{ "--d": "2100ms" } as React.CSSProperties}>
                  <h3>Quantity</h3>
                  <time>{ticketQuantity}</time>
                </div>
                <div className="animate-in-X" style={{ "--d": "2400ms" } as React.CSSProperties}>
                  <h3>Ticket No.</h3>
                  <time>{getShortTxRef(paymentData?.tx_ref || txRef)}</time>
                </div>
              </section>

              <p className="text-xs">
                Thank you for your payment! Your transaction has been <strong>successfully processed</strong>. 
                A confirmation email has been sent to your registered email address. 
                Please keep this <strong>transaction reference</strong> for your records: <strong>{paymentData?.tx_ref || txRef}</strong>.
                <br /><br />
                <strong>Note:</strong> Please download your ticket and present the QR code at the event entrance. The QR code contains all your payment and ticket information for verification.
              </p>
            </div>

            {/* stub */}
            <div className="grid place-content-center p-0 payment-success-stub">
              <div className="py-6 sm:py-0 sm:-rotate-90 w-full grid place-content-center gap-4">
                <section className="w-full grid grid-cols-3 gap-x-2 px-4 payment-success-stub-header">
                  <h2>PAY</h2>
                  <div>
                    <span className="payment-icon-stub">
                      <FaCheckCircle className="text-cyan-400 text-2xl" />
                    </span>
                  </div>
                  <h2>SUCCESS</h2>
                  <p>Payment</p>
                  <span></span>
                  <p>Confirmed</p>
                </section>

                <section className="flex justify-between gap-2 sm:gap-4 font-thin text-xs sm:text-sm whitespace-nowrap payment-success-stub-details">
                  <div>
                    <h3>Amount</h3>
                    <time>{paymentData ? `${formatAmount(getAmount())} ${paymentData.currency || 'ETB'}` : 'N/A'}</time>
                  </div>
                  <div>
                    <h3>Date</h3>
                    <time>{paymentData ? formatDate(paymentData.created_at) : formatDate()}</time>
                  </div>
                  <div>
                    <h3>Time</h3>
                    <time>{paymentData ? formatTime(paymentData.created_at) : formatTime()}</time>
                  </div>
                  <div>
                    <h3>Qty</h3>
                    <time>{ticketQuantity}</time>
                  </div>
                  <div>
                    <h3>Ticket No.</h3>
                    <time>{getShortTxRef(paymentData?.tx_ref || txRef)}</time>
                  </div>
                </section>

                {/* QR Code */}
                {qrCodeData && (
                  <div className="flex justify-center items-center p-2 sm:p-4 bg-white rounded">
                    <Suspense fallback={<div className="w-[180px] h-[180px] flex items-center justify-center"><FaSpinner className="animate-spin" /></div>}>
                      <QRCode
                        value={qrCodeData}
                        size={180}
                        level="M"
                        fgColor="#164E63"
                        bgColor="#ffffff"
                        className="max-w-full h-auto"
                      />
                    </Suspense>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {verificationStatus === "failed" && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mx-auto text-5xl text-red-500 mb-4">✕</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
            <p className="text-gray-600 mb-6">
              We couldn't verify your payment. This might be because:
            </p>
            <ul className="text-sm text-gray-600 mb-6 text-left list-disc list-inside space-y-1">
              <li>The payment is still being processed</li>
              <li>The transaction reference is invalid</li>
              <li>There was an issue connecting to the payment provider</li>
            </ul>
            
            {txRef && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Transaction Reference:</span>
                    <span className="font-semibold font-mono text-xs">{txRef}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Please save this reference number and contact support if you have already made the payment.
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setRetryCount(0);
                  setVerificationStatus("loading");
                  // Trigger re-verification
                  const verify = async () => {
                    if (!txRef) return;
                    try {
                      const response = await verifyPayment(txRef);
                      if (response.success && response.data) {
                        const status = response.data.status?.toLowerCase();
                        if (status === "success" || status === "successful" || status === "completed") {
                          setVerificationStatus("success");
                          setPaymentData(response.data);
                        } else {
                          setVerificationStatus("failed");
                        }
                      } else {
                        setVerificationStatus("failed");
                      }
                    } catch (error) {
                      setVerificationStatus("failed");
                    }
                  };
                  verify();
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                Retry Verification
              </button>
              <Link
                to="/contact"
                className="block w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-all"
              >
                Contact Support
              </Link>
              <Link
                to="/events"
                className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Back to Events
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;

