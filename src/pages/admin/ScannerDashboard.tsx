import { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaQrcode, FaSpinner, FaTicketAlt, FaTimesCircle, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ScannerHeader from "../../Components/admin/ScannerHeader";
import ScannerLayout from "../../Components/admin/ScannerLayout";
import { useScannerAuth } from "../../hooks/useScannerAuth";
import { supabase } from "../../services/supabase";
import { getTicketByTxRef, markTicketAsUsed } from "../../services/ticket";
import { Ticket } from "../../types";

const ScannerDashboard = () => {
  const { loading: authLoading, isScanner, isAdminUser } = useScannerAuth();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [markingAsUsed, setMarkingAsUsed] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [scanner, setScanner] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [scannedCount, setScannedCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const scannerRef = useRef<any>(null);

  // Load scanner data and statistics
  useEffect(() => {
    const loadScannerData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const email = session.user.email?.toLowerCase();
          if (email) {
            const { data } = await supabase
              .from('ticket_scanners')
              .select('*')
              .eq('email', email)
              .eq('is_active', true)
              .single();
            if (data) {
              setScanner(data);
            }
          }
        }
      } catch (err) {
        console.error('Error loading scanner data:', err);
      }
    };

    const loadScannedCount = async () => {
      try {
        setLoadingStats(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data, error } = await supabase
            .from('tickets')
            .select('id')
            .eq('status', 'used')
            .eq('verified_by', session.user.id);

          if (error) {
            console.error('Error loading scanned count:', error);
          } else {
            setScannedCount(data?.length || 0);
          }
        }
      } catch (err) {
        console.error('Error loading scanned count:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    if (!authLoading && (isScanner || isAdminUser)) {
      loadScannerData();
      loadScannedCount();
    }
  }, [authLoading, isScanner, isAdminUser]);

  // Redirect if not authorized
  useEffect(() => {
    if (!authLoading && !isScanner && !isAdminUser) {
      navigate('/admin/login');
    }
  }, [authLoading, isScanner, isAdminUser, navigate]);

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
  const formatAmount = (amount: number | string) => {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  // Parse QR code data and fetch ticket
  const handleQRScan = async (qrData: string) => {
    try {
      setError(null);
      setTicket(null);
      setLoading(true);

      let txRef: string | null = null;

      // Try to parse as JSON first
      try {
        const qrDataObj = JSON.parse(qrData);
        txRef = qrDataObj.tx_ref || qrDataObj.reference || qrDataObj.txRef || null;
      } catch (parseError) {
        // If not JSON, treat the entire string as tx_ref
        txRef = qrData.trim();
      }

      // If still no tx_ref, check if it's a URL with tx_ref parameter
      if (!txRef) {
        try {
          const url = new URL(qrData);
          txRef = url.searchParams.get('tx_ref') || url.searchParams.get('reference') || null;
        } catch (urlError) {
          // Not a URL either
        }
      }

      // If we still don't have a tx_ref, use the raw data
      if (!txRef) {
        txRef = qrData.trim();
      }

      if (!txRef || txRef.length === 0) {
        throw new Error("Invalid QR code: could not extract transaction reference");
      }

      console.log('Scanning ticket with tx_ref:', txRef);

      // Fetch ticket from database
      const fetchedTicket = await getTicketByTxRef(txRef);
      
      if (!fetchedTicket) {
        throw new Error(`Ticket not found in database for reference: ${txRef}`);
      }

      setTicket(fetchedTicket);
      stopScanning();
    } catch (err: any) {
      console.error('QR scan error:', err);
      setError(err.message || "Failed to process QR code. Please make sure the QR code is valid.");
      setTicket(null);
      stopScanning();
    } finally {
      setLoading(false);
    }
  };

  // Start scanning
  const startScanning = async () => {
    if (isScanning) return;

    try {
      setError(null);
      setTicket(null);
      setIsScanning(true);

      // Wait a bit for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Lazy load html5-qrcode only when needed
      const { Html5Qrcode: Html5QrcodeClass } = await import("html5-qrcode");
      const scannerId = "qr-reader";
      
      // Clear any existing scanner
      const existingElement = document.getElementById(scannerId);
      if (existingElement) {
        existingElement.innerHTML = '';
      }

      const html5QrCode = new Html5QrcodeClass(scannerId);
      scannerRef.current = html5QrCode;

      // Try to get available cameras first
      let cameraId: string | { facingMode: string } = { facingMode: "environment" };
      
      try {
        const cameras = await Html5QrcodeClass.getCameras();
        console.log('Available cameras:', cameras);
        
        if (cameras && cameras.length > 0) {
          // Try to find back camera first
          const backCamera = cameras.find(cam => 
            cam.label.toLowerCase().includes('back') || 
            cam.label.toLowerCase().includes('rear') ||
            cam.label.toLowerCase().includes('environment')
          );
          
          cameraId = backCamera?.id || cameras[0].id;
        }
      } catch (cameraError) {
        console.warn('Could not enumerate cameras, using default:', cameraError);
        // Fall back to facingMode
        cameraId = { facingMode: "environment" };
      }

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          // Successfully scanned
          console.log('QR code scanned:', decodedText);
          handleQRScan(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (they're frequent during scanning)
          // Only log if it's not a "not found" error
          if (!errorMessage.includes('No QR code found') && !errorMessage.includes('NotFoundException')) {
            console.debug('Scanning...', errorMessage);
          }
        }
      );
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      let errorMsg = `Failed to start camera: ${err.message}`;
      
      // Provide more helpful error messages
      if (err.message.includes('Permission denied') || err.message.includes('NotAllowedError')) {
        errorMsg = "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (err.message.includes('NotFoundError') || err.message.includes('no camera')) {
        errorMsg = "No camera found. Please make sure your device has a camera.";
      } else if (err.message.includes('NotReadableError')) {
        errorMsg = "Camera is already in use by another application.";
      }
      
      setError(errorMsg);
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

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setTicket(null);
      setLoading(true);

      // Lazy load html5-qrcode only when needed
      const { Html5Qrcode: Html5QrcodeClass } = await import("html5-qrcode");
      const html5QrCode = new Html5QrcodeClass("qr-reader");
      
      const decodedText = await html5QrCode.scanFile(file, false);
      await handleQRScan(decodedText);
    } catch (err: any) {
      setError(`Failed to scan image: ${err.message}`);
      setTicket(null);
      setLoading(false);
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

  // Mark ticket as used
  const handleMarkAsUsed = async () => {
    if (!ticket || !user) return;

    try {
      setMarkingAsUsed(true);
      setError(null);

      const updatedTicket = await markTicketAsUsed(ticket.tx_ref, user.id);
      setTicket(updatedTicket);
      
      // Refresh scanned count
      const { data } = await supabase
        .from('tickets')
        .select('id')
        .eq('status', 'used')
        .eq('verified_by', user.id);
      setScannedCount(data?.length || 0);
    } catch (err: any) {
      setError(err.message || "Failed to mark ticket as used");
    } finally {
      setMarkingAsUsed(false);
    }
  };

  // Clear results
  const clearResults = () => {
    setTicket(null);
    setError(null);
    setManualInput("");
    stopScanning();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "used") {
      return "text-purple-600 bg-purple-100";
    }
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

  if (authLoading || !scanner) {
    return (
      <ScannerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading scanner dashboard...</p>
          </div>
        </div>
      </ScannerLayout>
    );
  }

  return (
    <ScannerLayout>
      <ScannerHeader scanner={scanner} user={user} title="Ticket Scanner" />
      <main className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto pb-20 md:pb-8">
        {/* Mobile Welcome Card */}
        <div className="mb-4 md:hidden bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-90">Welcome back,</p>
              <p className="text-xl font-bold">{scanner.name}</p>
              <p className="text-xs opacity-75 mt-1">Scan tickets to verify entry</p>
            </div>
          </div>
        </div>

        {/* Statistics Card - Mobile App Style */}
        <div className="mb-6 grid grid-cols-1 gap-4">
          <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Tickets Scanned</p>
                {loadingStats ? (
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl md:text-4xl font-bold text-blue-600">{scannedCount}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Total verified tickets</p>
              </div>
              <div className="h-16 w-16 md:h-20 md:w-20 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FaTicketAlt className="text-blue-600" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Scanner Section - Mobile App Style */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Scan Ticket</h2>
          <div className="flex flex-col gap-3 mb-4">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg active:scale-95"
              >
                <FaQrcode size={20} />
                <span>Start Camera Scanner</span>
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="w-full flex items-center justify-center gap-3 bg-red-500 text-white px-6 py-4 rounded-xl font-semibold hover:bg-red-600 transition-all shadow-lg active:scale-95"
              >
                <FaTimesCircle size={20} />
                <span>Stop Scanning</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center justify-center gap-2 bg-indigo-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-all cursor-pointer active:scale-95 shadow-md">
                <FaUpload size={18} />
                <span className="text-sm">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>

              <button
                onClick={() => {
                  setShowManualInput(!showManualInput);
                  setError(null);
                }}
                className="flex items-center justify-center gap-2 bg-gray-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all active:scale-95 shadow-md"
              >
                <span className="text-sm">Manual Entry</span>
              </button>
            </div>
          </div>

          {/* Manual Input */}
          {showManualInput && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Paste QR code data here (JSON, tx_ref, or URL)..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleManualInput}
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all disabled:opacity-50"
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
              <div id="qr-reader" className="w-full max-w-md mx-auto rounded-xl overflow-hidden"></div>
              <p className="text-center text-sm text-gray-600 mt-3 font-medium">
                Point camera at QR code to scan
              </p>
              <p className="text-center text-xs text-gray-500 mt-1">
                Make sure the QR code is clearly visible and well-lit
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
              <FaSpinner className="animate-spin text-blue-600" />
              <span className="text-blue-700">Loading ticket information...</span>
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

        {/* Ticket Details - Mobile App Style */}
        {ticket && (
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Ticket Details</h2>
              <button
                onClick={clearResults}
                className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                Clear
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Status:</span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                  {ticket.status.toUpperCase()}
                </span>
              </div>

              {/* Payment Information - Mobile App Style */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-blue-50 rounded-xl">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Transaction Reference</h3>
                  <p className="text-lg font-mono text-gray-900">{ticket.tx_ref}</p>
                </div>
                {ticket.chapa_reference && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Payment Reference</h3>
                    <p className="text-lg font-mono text-gray-900">{ticket.chapa_reference}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Amount Paid</h3>
                  <p className="text-xl font-bold text-gray-900">
                    {formatAmount(ticket.amount)} {ticket.currency}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Number of Tickets</h3>
                  <p className="text-2xl font-bold text-blue-600">{ticket.quantity}</p>
                </div>
              </div>

              {/* Customer Information - Mobile App Style */}
              {(ticket.customer_name || ticket.customer_email) && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    {ticket.customer_name && (
                      <div>
                        <span className="text-xs text-gray-500">Name</span>
                        <p className="font-semibold text-gray-900">{ticket.customer_name}</p>
                      </div>
                    )}
                    {ticket.customer_email && (
                      <div>
                        <span className="text-xs text-gray-500">Email</span>
                        <p className="font-semibold text-gray-900 break-all">{ticket.customer_email}</p>
                      </div>
                    )}
                    {ticket.customer_phone && (
                      <div>
                        <span className="text-xs text-gray-500">Phone</span>
                        <p className="font-semibold text-gray-900">{ticket.customer_phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Event Information - Mobile App Style */}
              {ticket.event_title && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="text-xs text-gray-500 mb-1">Event</h3>
                  <p className="font-semibold text-gray-900">{ticket.event_title}</p>
                </div>
              )}

              {/* Transaction Details - Mobile App Style */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Transaction Details</h3>
                <div className="space-y-2">
                  {ticket.payment_date && (
                    <div>
                      <span className="text-xs text-gray-500">Payment Date</span>
                      <p className="font-semibold text-gray-900">{formatDate(ticket.payment_date)}</p>
                    </div>
                  )}
                  {ticket.verified_at && (
                    <div>
                      <span className="text-xs text-gray-500">Verified At</span>
                      <p className="font-semibold text-gray-900">{formatDate(ticket.verified_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Result - Mobile App Style */}
              <div className={`p-4 rounded-xl border-2 ${
                ticket.status === 'used'
                  ? "bg-purple-50 border-purple-200"
                  : ticket.status === 'success'
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  {ticket.status === 'used' ? (
                    <>
                      <div className="flex items-center gap-3">
                        <FaCheckCircle className="text-3xl text-purple-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-bold text-purple-900">Ticket Already Used</h3>
                          <p className="text-sm text-purple-700">
                            This ticket has already been scanned and marked as used.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : ticket.status === 'success' ? (
                    <>
                      <div className="flex items-center gap-3 flex-1">
                        <FaCheckCircle className="text-3xl text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-bold text-green-900">Payment Verified</h3>
                          <p className="text-sm text-green-700">
                            This ticket is valid. Customer can enter with {ticket.quantity} {ticket.quantity === 1 ? 'ticket' : 'tickets'}.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleMarkAsUsed}
                        disabled={markingAsUsed}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95"
                      >
                        {markingAsUsed ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Marking...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle />
                            Mark as Used
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <FaTimesCircle className="text-3xl text-yellow-600 flex-shrink-0" />
                        <div>
                          <h3 className="font-bold text-yellow-900">Payment Status: {ticket.status}</h3>
                          <p className="text-sm text-yellow-700">
                            Please verify payment status before allowing entry.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions - Mobile App Style */}
        {!ticket && !error && !loading && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <FaQrcode className="text-white" size={20} />
              </div>
              <h3 className="font-bold text-blue-900 text-lg">How to Scan Tickets</h3>
            </div>
            <ol className="space-y-3 text-blue-800">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Tap "Start Camera Scanner" to use your device camera</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Or tap "Upload Image" to scan from a photo</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Point the camera at the QR code on the ticket</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Verify payment status and tap "Mark as Used" after entry</span>
              </li>
            </ol>
          </div>
        )}
      </main>
    </ScannerLayout>
  );
};

export default ScannerDashboard;

