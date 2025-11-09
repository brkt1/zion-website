import { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaQrcode, FaTimesCircle, FaUpload } from "react-icons/fa";
import AdminLayout from "../../Components/admin/AdminLayout";
import { useAdminAuth } from "../../hooks/useAdminAuth";

// Lazy load html5-qrcode to reduce initial bundle size (admin-only feature)

interface TicketData {
  tx_ref: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
  reference: string;
  quantity: number;
  email: string;
  name: string;
}

const VerifyTicket = () => {
  const { loading: authLoading, isAdminUser } = useAdminAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const scannerRef = useRef<any>(null);
  const scanAreaRef = useRef<HTMLDivElement>(null);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Format amount for display
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Parse QR code data
  const parseQRData = (qrData: string): TicketData | null => {
    try {
      const data = JSON.parse(qrData);
      
      // Validate required fields
      if (!data.tx_ref && !data.reference) {
        throw new Error("Invalid ticket data: missing transaction reference");
      }

      return {
        tx_ref: data.tx_ref || data.reference || "",
        amount: data.amount || 0,
        currency: data.currency || "ETB",
        date: data.date || new Date().toISOString(),
        status: data.status || "unknown",
        reference: data.reference || data.tx_ref || "",
        quantity: data.quantity || 1,
        email: data.email || "",
        name: data.name || ""
      };
    } catch (err: any) {
      throw new Error(`Failed to parse QR code: ${err.message}`);
    }
  };

  // Start scanning
  const startScanning = async () => {
    if (isScanning) return;

    try {
      setError(null);
      setTicketData(null);
      setIsScanning(true);

      // Lazy load html5-qrcode only when needed
      const { Html5Qrcode: Html5QrcodeClass } = await import("html5-qrcode");
      const scannerId = "qr-reader";
      const html5QrCode = new Html5QrcodeClass(scannerId);

      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Successfully scanned
          handleQRScan(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (they're frequent during scanning)
        }
      );
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      setError(`Failed to start camera: ${err.message}`);
      setIsScanning(false);
      scannerRef.current = null;
    }
  };

  // Stop scanning
  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Handle QR code scan result
  const handleQRScan = (qrData: string) => {
    try {
      const parsed = parseQRData(qrData);
      setTicketData(parsed);
      setError(null);
      stopScanning();
    } catch (err: any) {
      setError(err.message);
      setTicketData(null);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setTicketData(null);

      // Lazy load html5-qrcode only when needed
      const { Html5Qrcode: Html5QrcodeClass } = await import("html5-qrcode");
      const html5QrCode = new Html5QrcodeClass("qr-reader");
      
      const decodedText = await html5QrCode.scanFile(file, false);
      handleQRScan(decodedText);
    } catch (err: any) {
      setError(`Failed to scan image: ${err.message}`);
      setTicketData(null);
    }
  };

  // Handle manual input
  const handleManualInput = () => {
    if (!manualInput.trim()) {
      setError("Please enter QR code data");
      return;
    }
    handleQRScan(manualInput.trim());
    setManualInput("");
    setShowManualInput(false);
  };

  // Clear results
  const clearResults = () => {
    setTicketData(null);
    setError(null);
    setManualInput("");
  };

  // Redirect commission sellers
  useEffect(() => {
    if (!authLoading && !isAdminUser) {
      window.location.href = '/admin/seller-dashboard';
    }
  }, [authLoading, isAdminUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "success" || lowerStatus === "successful" || lowerStatus === "completed") {
      return "text-green-600 bg-green-100";
    }
    if (lowerStatus === "failed" || lowerStatus === "cancelled" || lowerStatus === "canceled") {
      return "text-red-600 bg-red-100";
    }
    if (lowerStatus === "pending" || lowerStatus === "processing") {
      return "text-yellow-600 bg-yellow-100";
    }
    return "text-gray-600 bg-gray-100";
  };

  return (
    <AdminLayout title="Ticket Verification">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <p className="text-gray-600">Scan QR code from customer tickets to verify payment and entry</p>
        </div>

        {/* Scanner Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="flex items-center justify-center gap-2 bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition-all"
              >
                <FaQrcode />
                Start Camera Scanner
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all"
              >
                <FaTimesCircle />
                Stop Scanning
              </button>
            )}

            <label className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all cursor-pointer">
              <FaUpload />
              Upload QR Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                setShowManualInput(!showManualInput);
                setError(null);
              }}
              className="flex items-center justify-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
            >
              Manual Entry
            </button>
          </div>

          {/* Manual Input */}
          {showManualInput && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Paste QR code JSON data here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                rows={4}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleManualInput}
                  className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition-all"
                >
                  Verify
                </button>
                <button
                  onClick={() => {
                    setShowManualInput(false);
                    setManualInput("");
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Scanner Area */}
          {isScanning && (
            <div className="mb-4">
              <div id="qr-reader" ref={scanAreaRef} className="w-full max-w-md mx-auto"></div>
              <p className="text-center text-sm text-gray-600 mt-2">
                Point camera at QR code to scan
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <FaTimesCircle />
                <span className="font-semibold">Error:</span>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Ticket Details */}
        {ticketData && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Ticket Details</h2>
              <button
                onClick={clearResults}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Status:</span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(ticketData.status)}`}>
                  {ticketData.status.toUpperCase()}
                </span>
              </div>

              {/* Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-cyan-50 rounded-lg">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Transaction Reference</h3>
                  <p className="text-lg font-mono text-gray-900">{ticketData.tx_ref}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Reference Number</h3>
                  <p className="text-lg font-mono text-gray-900">{ticketData.reference}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Amount Paid</h3>
                  <p className="text-xl font-bold text-gray-900">
                    {formatAmount(ticketData.amount)} {ticketData.currency}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Number of Tickets</h3>
                  <p className="text-2xl font-bold text-cyan-600">{ticketData.quantity}</p>
                </div>
              </div>

              {/* Customer Information */}
              {(ticketData.name || ticketData.email) && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    {ticketData.name && (
                      <div>
                        <span className="text-sm text-gray-600">Name: </span>
                        <span className="font-semibold text-gray-900">{ticketData.name}</span>
                      </div>
                    )}
                    {ticketData.email && (
                      <div>
                        <span className="text-sm text-gray-600">Email: </span>
                        <span className="font-semibold text-gray-900">{ticketData.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transaction Details */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Transaction Details</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Date & Time: </span>
                    <span className="font-semibold text-gray-900">{formatDate(ticketData.date)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Currency: </span>
                    <span className="font-semibold text-gray-900">{ticketData.currency}</span>
                  </div>
                </div>
              </div>

              {/* Verification Result */}
              <div className={`p-4 rounded-lg border-2 ${
                ticketData.status.toLowerCase() === "success" || 
                ticketData.status.toLowerCase() === "successful" || 
                ticketData.status.toLowerCase() === "completed"
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}>
                <div className="flex items-center gap-3">
                  {ticketData.status.toLowerCase() === "success" || 
                   ticketData.status.toLowerCase() === "successful" || 
                   ticketData.status.toLowerCase() === "completed" ? (
                    <>
                      <FaCheckCircle className="text-3xl text-green-600" />
                      <div>
                        <h3 className="font-bold text-green-900">Payment Verified</h3>
                        <p className="text-sm text-green-700">
                          This ticket is valid. Customer can enter with {ticketData.quantity} {ticketData.quantity === 1 ? 'ticket' : 'tickets'}.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-3xl text-yellow-600" />
                      <div>
                        <h3 className="font-bold text-yellow-900">Payment Status: {ticketData.status}</h3>
                        <p className="text-sm text-yellow-700">
                          Please verify payment status before allowing entry.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!ticketData && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-2">How to Verify Tickets:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Click "Start Camera Scanner" to use your device camera</li>
              <li>Or click "Upload QR Image" to scan from an image file</li>
              <li>Or use "Manual Entry" to paste QR code data directly</li>
              <li>Point the camera at the QR code on the customer's ticket</li>
              <li>Once scanned, ticket details will appear automatically</li>
              <li>Verify the payment status and number of tickets</li>
            </ol>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default VerifyTicket;

