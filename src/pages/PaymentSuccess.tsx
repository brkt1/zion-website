import { useEffect, useState } from "react";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import { verifyPayment } from "../services/payment";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get("tx_ref");
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "failed" | "pending">("loading");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const verify = async (attempt: number = 0) => {
      if (!txRef) {
        setVerificationStatus("failed");
        return;
      }

      try {
        const response = await verifyPayment(txRef);
        console.log("Verification response (attempt " + (attempt + 1) + "):", response);
        
        if (response.success && response.data) {
          setPaymentData(response.data);
          // Check various possible status values
          const status = response.data.status?.toLowerCase();
          if (status === "success" || status === "successful" || status === "completed") {
            setVerificationStatus("success");
          } else if (status === "failed" || status === "cancelled" || status === "canceled") {
            setVerificationStatus("failed");
          } else if (status === "pending" || status === "processing") {
            // Retry for pending payments (up to 3 times with delay)
            if (attempt < 3) {
              console.log(`Payment is pending, retrying in ${(attempt + 1) * 2} seconds...`);
              setTimeout(() => {
                setRetryCount(attempt + 1);
                verify(attempt + 1);
              }, (attempt + 1) * 2000); // 2s, 4s, 6s delays
              setVerificationStatus("pending");
            } else {
              console.warn("Payment still pending after retries");
              setVerificationStatus("failed");
            }
          } else {
            // Unknown status - show the data but mark as failed
            console.warn("Unknown payment status:", status, response.data);
            setVerificationStatus("failed");
          }
        } else {
          // If verification fails but we have a tx_ref, it might be pending
          if (attempt < 2) {
            console.log("Verification failed, retrying...");
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
  }, [txRef, retryCount]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {(verificationStatus === "loading" || verificationStatus === "pending") && (
          <>
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
          </>
        )}

        {verificationStatus === "success" && (
          <>
            <FaCheckCircle className="mx-auto text-5xl text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your payment. Your registration has been confirmed.
            </p>
            
            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Reference:</span>
                    <span className="font-semibold">{paymentData.tx_ref}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">{paymentData.amount} {paymentData.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-green-600 capitalize">{paymentData.status}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/events"
                className="block w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-all"
              >
                Browse More Events
              </Link>
              <Link
                to="/"
                className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Go to Home
              </Link>
            </div>
          </>
        )}

        {verificationStatus === "failed" && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;

