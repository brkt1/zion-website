import { useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyPayment } from "../services/payment";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const txRef = searchParams.get("tx_ref");

  useEffect(() => {
    const handleCallback = async () => {
      if (!txRef) {
        navigate("/payment/failed");
        return;
      }

      try {
        const response = await verifyPayment(txRef);
        if (response.success && response.data) {
          if (response.data.status === "success") {
            navigate(`/payment/success?tx_ref=${txRef}`);
          } else {
            navigate("/payment/failed");
          }
        } else {
          navigate("/payment/failed");
        }
      } catch (error) {
        console.error("Callback verification error:", error);
        navigate("/payment/failed");
      }
    };

    handleCallback();
  }, [txRef, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <FaSpinner className="mx-auto text-5xl text-amber-600 animate-spin mb-4" />
        <p className="text-gray-600">Processing your payment...</p>
      </div>
    </div>
  );
};

export default PaymentCallback;

