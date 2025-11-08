import { useEffect, useState } from "react";
import { FaSpinner, FaTimesCircle } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import { verifyPayment } from "../services/payment";

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get("tx_ref");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!txRef) {
        setLoading(false);
        return;
      }

      try {
        const response = await verifyPayment(txRef);
        if (response.success && response.data) {
          setPaymentData(response.data);
        }
      } catch (error) {
        console.error("Verification error:", error);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [txRef]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {loading ? (
          <>
            <FaSpinner className="mx-auto text-5xl text-amber-600 animate-spin mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Checking Payment Status...</h1>
            <p className="text-gray-600">Please wait while we check your payment status.</p>
          </>
        ) : (
          <>
            <FaTimesCircle className="mx-auto text-5xl text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed or Cancelled</h1>
            <p className="text-gray-600 mb-6">
              Your payment was not completed. This could be because you cancelled the payment or there was an issue processing it.
            </p>
            
            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Reference:</span>
                    <span className="font-semibold">{paymentData.tx_ref || txRef}</span>
                  </div>
                  {paymentData.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold">{paymentData.amount} {paymentData.currency || 'ETB'}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-red-600 capitalize">
                      {paymentData.status === 'failed' ? 'Failed' : paymentData.status === 'cancelled' ? 'Cancelled' : paymentData.status || 'Failed'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                If you believe this is an error or need assistance, please contact our support team.
              </p>
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
              <Link
                to="/"
                className="block w-full text-gray-600 py-2 text-sm hover:text-amber-600 transition-all"
              >
                Go to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentFailed;

