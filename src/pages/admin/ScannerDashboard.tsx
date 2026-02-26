import { useEffect, useRef, useState } from "react";
import {
    FaCheck,
    FaCheckCircle,
    FaClipboardList,
    FaEnvelope,
    FaGlobe,
    FaPhone,
    FaQrcode,
    FaSearch,
    FaSpinner,
    FaTicketAlt,
    FaTimes,
    FaTimesCircle,
    FaTrash,
    FaUpload,
    FaUser,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import ScannerHeader from "../../Components/admin/ScannerHeader";
import ScannerLayout from "../../Components/admin/ScannerLayout";
import { useScannerAuth } from "../../hooks/useScannerAuth";
import { adminApi } from "../../services/adminApi";
import { supabase } from "../../services/supabase";
import { getTicketByTxRef, markTicketAsUsed } from "../../services/ticket";
import { ExpoApplication, Ticket } from "../../types";

const ScannerDashboard = () => {
  const { loading: authLoading, isScanner, isAdminUser } = useScannerAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"scan" | "registrants">("scan");
  const [registrants, setRegistrants] = useState<ExpoApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingRegistrants, setLoadingRegistrants] = useState(false);

  // Expo application modal state
  const [selectedApp, setSelectedApp] = useState<ExpoApplication | null>(null);
  const [showAppModal, setShowAppModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [appNotes, setAppNotes] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "reviewed" | "accepted" | "rejected">("all");

  // Ticket scanning state
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
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const email = session.user.email?.toLowerCase();
          if (email) {
            const { data } = await supabase
              .from("ticket_scanners")
              .select("*")
              .eq("email", email)
              .eq("is_active", true)
              .single();
            if (data) {
              setScanner(data);
            }
          }
        }
      } catch (err) {
        console.error("Error loading scanner data:", err);
      }
    };

    const loadScannedCount = async () => {
      try {
        setLoadingStats(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data, error } = await supabase
            .from("tickets")
            .select("id")
            .eq("status", "used")
            .eq("verified_by", session.user.id);

          if (error) {
            console.error("Error loading scanned count:", error);
          } else {
            setScannedCount(data?.length || 0);
          }
        }
      } catch (err) {
        console.error("Error loading scanned count:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    if (!authLoading && (isScanner || isAdminUser)) {
      loadScannerData();
      loadScannedCount();
      loadRegistrantsData();
    }
  }, [authLoading, isScanner, isAdminUser]);

  const loadRegistrantsData = async () => {
    try {
      setLoadingRegistrants(true);
      const data = await adminApi.expoApplications.getAll();
      setRegistrants(data || []);
    } catch (err) {
      console.error("Error loading registrants:", err);
    } finally {
      setLoadingRegistrants(false);
    }
  };

  // Redirect if not authorized
  useEffect(() => {
    if (!authLoading && !isScanner && !isAdminUser) {
      navigate("/admin/login");
    }
  }, [authLoading, isScanner, isAdminUser, navigate]);

  // ─── Expo Application CRUD ─────────────────────────────────────────────────

  const openAppModal = (app: ExpoApplication) => {
    setSelectedApp(app);
    setAppNotes(app.notes || "");
    setShowAppModal(true);
  };

  const closeAppModal = () => {
    setShowAppModal(false);
    setSelectedApp(null);
    setAppNotes("");
  };

  const handleStatusUpdate = async (
    newStatus: "pending" | "reviewed" | "accepted" | "rejected"
  ) => {
    if (!selectedApp) return;
    setUpdatingStatus(true);
    try {
      const updated = await adminApi.expoApplications.update(selectedApp.id, {
        status: newStatus,
        notes: appNotes || undefined,
      });
      setRegistrants((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setSelectedApp(updated);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setUpdatingStatus(true);
    try {
      const updated = await adminApi.expoApplications.update(selectedApp.id, {
        notes: appNotes,
      });
      setRegistrants((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setSelectedApp(updated);
      alert("Notes saved!");
    } catch (err) {
      alert("Failed to save notes.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this application?"))
      return;
    setDeletingId(id);
    try {
      await adminApi.expoApplications.delete(id);
      setRegistrants((prev) => prev.filter((a) => a.id !== id));
      if (selectedApp?.id === id) closeAppModal();
    } catch (err) {
      alert("Failed to delete application.");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Ticket Scanning ───────────────────────────────────────────────────────

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount: number | string) => {
    const numAmount =
      typeof amount === "number" ? amount : parseFloat(String(amount)) || 0;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const handleQRScan = async (qrData: string) => {
    try {
      setError(null);
      setTicket(null);
      setLoading(true);

      let txRef: string | null = null;

      try {
        const qrDataObj = JSON.parse(qrData);
        txRef =
          qrDataObj.tx_ref ||
          qrDataObj.reference ||
          qrDataObj.txRef ||
          null;
      } catch {
        txRef = qrData.trim();
      }

      if (!txRef) {
        try {
          const url = new URL(qrData);
          txRef =
            url.searchParams.get("tx_ref") ||
            url.searchParams.get("reference") ||
            null;
        } catch {}
      }

      if (!txRef) txRef = qrData.trim();

      if (!txRef || txRef.length === 0) {
        throw new Error("Invalid QR code: could not extract transaction reference");
      }

      const fetchedTicket = await getTicketByTxRef(txRef);

      if (!fetchedTicket) {
        throw new Error(`Ticket not found in database for reference: ${txRef}`);
      }

      setTicket(fetchedTicket);
      stopScanning();
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to process QR code. Please make sure the QR code is valid."
      );
      setTicket(null);
      stopScanning();
    } finally {
      setLoading(false);
    }
  };

  const startScanning = async () => {
    if (isScanning) return;
    try {
      setError(null);
      setTicket(null);
      setIsScanning(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { Html5Qrcode: Html5QrcodeClass } = await import("html5-qrcode");
      const scannerId = "qr-reader";
      const existingElement = document.getElementById(scannerId);
      if (existingElement) existingElement.innerHTML = "";

      const html5QrCode = new Html5QrcodeClass(scannerId);
      scannerRef.current = html5QrCode;

      let cameraId: string | { facingMode: string } = {
        facingMode: "environment",
      };

      try {
        const cameras = await Html5QrcodeClass.getCameras();
        if (cameras && cameras.length > 0) {
          const backCamera = cameras.find(
            (cam) =>
              cam.label.toLowerCase().includes("back") ||
              cam.label.toLowerCase().includes("rear") ||
              cam.label.toLowerCase().includes("environment")
          );
          cameraId = backCamera?.id || cameras[0].id;
        }
      } catch {
        cameraId = { facingMode: "environment" };
      }

      await html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText: string) => handleQRScan(decodedText),
        (errorMessage: string) => {
          if (
            !errorMessage.includes("No QR code found") &&
            !errorMessage.includes("NotFoundException")
          ) {
            console.debug("Scanning...", errorMessage);
          }
        }
      );
    } catch (err: any) {
      let errorMsg = `Failed to start camera: ${err.message}`;
      if (
        err.message.includes("Permission denied") ||
        err.message.includes("NotAllowedError")
      ) {
        errorMsg =
          "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (
        err.message.includes("NotFoundError") ||
        err.message.includes("no camera")
      ) {
        errorMsg =
          "No camera found. Please make sure your device has a camera.";
      } else if (err.message.includes("NotReadableError")) {
        errorMsg = "Camera is already in use by another application.";
      }
      setError(errorMsg);
      setIsScanning(false);
      scannerRef.current = null;
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setError(null);
      setTicket(null);
      setLoading(true);
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

  const handleManualInput = () => {
    if (!manualInput.trim()) {
      setError("Please enter QR code data");
      return;
    }
    handleQRScan(manualInput.trim());
    setManualInput("");
    setShowManualInput(false);
  };

  const handleMarkAsUsed = async () => {
    if (!ticket || !user) return;
    try {
      setMarkingAsUsed(true);
      setError(null);
      const updatedTicket = await markTicketAsUsed(ticket.tx_ref, user.id);
      setTicket(updatedTicket);
      const { data } = await supabase
        .from("tickets")
        .select("id")
        .eq("status", "used")
        .eq("verified_by", user.id);
      setScannedCount(data?.length || 0);
    } catch (err: any) {
      setError(err.message || "Failed to mark ticket as used");
    } finally {
      setMarkingAsUsed(false);
    }
  };

  const clearResults = () => {
    setTicket(null);
    setError(null);
    setManualInput("");
    stopScanning();
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "used") return "text-purple-600 bg-purple-100";
    if (s === "success" || s === "successful" || s === "completed")
      return "text-green-600 bg-green-100";
    if (s === "failed" || s === "cancelled" || s === "canceled")
      return "text-red-600 bg-red-100";
    if (s === "pending" || s === "processing")
      return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  const getAppStatusStyle = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "reviewed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const getBoothLabel = (type: string) => {
    switch (type) {
      case "premium": return "Premium Platinum";
      case "standard": return "Diamond Inline";
      case "shared": return "Shared / Creative";
      default: return type;
    }
  };

  const getPaymentLabel = (option: string) => {
    switch (option) {
      case "full": return "Pay Full Amount";
      case "deposit": return "Pay 50% Deposit";
      default: return option || "—";
    }
  };

  const filteredRegistrants = registrants.filter((app) => {
    const matchesSearch =
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statsCounts = {
    all: registrants.length,
    pending: registrants.filter((a) => a.status === "pending").length,
    reviewed: registrants.filter((a) => a.status === "reviewed").length,
    accepted: registrants.filter((a) => a.status === "accepted").length,
    rejected: registrants.filter((a) => a.status === "rejected").length,
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
      <ScannerHeader scanner={scanner} user={user} title="Scanner Admin" />

      {/* Tab Switcher */}
      <div className="bg-white border-b border-gray-100 sticky top-14 md:top-16 z-10 px-4">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setActiveTab("scan")}
            className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${
              activeTab === "scan"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-400"
            }`}
          >
            Verify Entry
          </button>
          <button
            onClick={() => setActiveTab("registrants")}
            className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${
              activeTab === "registrants"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-400"
            }`}
          >
            Exhibitors ({statsCounts.all})
          </button>
        </div>
      </div>

      <main className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto pb-20 md:pb-8">
        {activeTab === "scan" ? (
          <>
            <div className="mb-4 md:hidden bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg">
              <p className="text-sm opacity-90">Welcome back,</p>
              <p className="text-xl font-bold">{scanner.name}</p>
              <p className="text-xs opacity-75 mt-1">Scan tickets to verify entry</p>
            </div>

            {/* Statistics Card */}
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

            {/* Scanner Section */}
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

              {isScanning && (
                <div className="mb-4">
                  <div id="qr-reader" className="w-full max-w-md mx-auto rounded-xl overflow-hidden"></div>
                  <p className="text-center text-sm text-gray-600 mt-3 font-medium">Point camera at QR code to scan</p>
                  <p className="text-center text-xs text-gray-500 mt-1">Make sure the QR code is clearly visible and well-lit</p>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
                  <FaSpinner className="animate-spin text-blue-600" />
                  <span className="text-blue-700">Loading ticket information...</span>
                </div>
              )}

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
            {ticket && (
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Ticket Details</h2>
                  <button onClick={clearResults} className="text-gray-500 hover:text-gray-700 transition-colors text-sm">Clear</button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">Status:</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>

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
                      <p className="text-xl font-bold text-gray-900">{formatAmount(ticket.amount)} {ticket.currency}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Number of Tickets</h3>
                      <p className="text-2xl font-bold text-blue-600">{ticket.quantity}</p>
                    </div>
                  </div>

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

                  {ticket.event_title && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="text-xs text-gray-500 mb-1">Event</h3>
                      <p className="font-semibold text-gray-900">{ticket.event_title}</p>
                    </div>
                  )}

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

                  <div className={`p-4 rounded-xl border-2 ${
                    ticket.status === "used"
                      ? "bg-purple-50 border-purple-200"
                      : ticket.status === "success"
                      ? "bg-green-50 border-green-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      {ticket.status === "used" ? (
                        <div className="flex items-center gap-3">
                          <FaCheckCircle className="text-3xl text-purple-600 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-bold text-purple-900">Ticket Already Used</h3>
                            <p className="text-sm text-purple-700">This ticket has already been scanned and marked as used.</p>
                          </div>
                        </div>
                      ) : ticket.status === "success" ? (
                        <>
                          <div className="flex items-center gap-3 flex-1">
                            <FaCheckCircle className="text-3xl text-green-600 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-bold text-green-900">Payment Verified</h3>
                              <p className="text-sm text-green-700">
                                This ticket is valid. Customer can enter with {ticket.quantity} {ticket.quantity === 1 ? "ticket" : "tickets"}.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleMarkAsUsed}
                            disabled={markingAsUsed}
                            className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg active:scale-95"
                          >
                            {markingAsUsed ? (
                              <><FaSpinner className="animate-spin" /> Marking...</>
                            ) : (
                              <><FaCheckCircle /> Mark as Used</>
                            )}
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-3">
                          <FaTimesCircle className="text-3xl text-yellow-600 flex-shrink-0" />
                          <div>
                            <h3 className="font-bold text-yellow-900">Payment Status: {ticket.status}</h3>
                            <p className="text-sm text-yellow-700">Please verify payment status before allowing entry.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!ticket && !error && !loading && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <FaQrcode className="text-white" size={20} />
                  </div>
                  <h3 className="font-bold text-blue-900 text-lg">How to Scan Tickets</h3>
                </div>
                <ol className="space-y-3 text-blue-800">
                  {[
                    'Tap "Start Camera Scanner" to use your device camera',
                    'Or tap "Upload Image" to scan from a photo',
                    "Point the camera at the QR code on the ticket",
                    'Verify payment status and tap "Mark as Used" after entry',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        ) : (
          /* ─── EXHIBITORS TAB ──────────────────────────────────────────────── */
          <div className="space-y-4">
            {/* Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(["all", "pending", "reviewed", "accepted", "rejected"] as const).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`p-3 rounded-2xl text-center border-2 transition-all ${
                      statusFilter === s
                        ? s === "accepted"
                          ? "bg-green-500 border-green-500 text-white"
                          : s === "rejected"
                          ? "bg-red-500 border-red-500 text-white"
                          : s === "reviewed"
                          ? "bg-blue-500 border-blue-500 text-white"
                          : s === "pending"
                          ? "bg-amber-500 border-amber-500 text-white"
                          : "bg-gray-800 border-gray-800 text-white"
                        : "bg-white border-gray-100 text-gray-600"
                    }`}
                  >
                    <p className="text-xl font-black">{statsCounts[s]}</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold capitalize">{s}</p>
                  </button>
                )
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-3">
                <FaClipboardList className="text-blue-600" />
                Registered Exhibitors
              </h2>

              {/* Search Bar */}
              <div className="relative mb-5">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by company, curator, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                />
              </div>

              {loadingRegistrants ? (
                <div className="py-12 text-center">
                  <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                    Loading curator data...
                  </p>
                </div>
              ) : filteredRegistrants.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                  No exhibitors found
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRegistrants.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg flex-shrink-0">
                            {app.companyName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{app.companyName}</p>
                            <p className="text-xs text-gray-500 font-medium truncate">{app.contactPerson}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getAppStatusStyle(app.status)}`}
                          >
                            {app.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                            <FaGlobe className="text-blue-400" size={10} />
                            {app.category}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                            <FaTicketAlt className="text-blue-400" size={10} />
                            {getBoothLabel(app.boothType)}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          {/* Quick approve */}
                          {app.status !== "accepted" && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!window.confirm(`Accept application from ${app.companyName}?`)) return;
                                try {
                                  const updated = await adminApi.expoApplications.update(app.id, { status: "accepted" });
                                  setRegistrants((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
                                } catch {
                                  alert("Failed to update.");
                                }
                              }}
                              className="w-7 h-7 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white transition-all"
                              title="Accept"
                            >
                              <FaCheck size={10} />
                            </button>
                          )}

                          {/* Quick reject */}
                          {app.status !== "rejected" && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!window.confirm(`Reject application from ${app.companyName}?`)) return;
                                try {
                                  const updated = await adminApi.expoApplications.update(app.id, { status: "rejected" });
                                  setRegistrants((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
                                } catch {
                                  alert("Failed to update.");
                                }
                              }}
                              className="w-7 h-7 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-600 hover:bg-red-500 hover:text-white transition-all"
                              title="Reject"
                            >
                              <FaTimes size={10} />
                            </button>
                          )}

                          {/* View details */}
                          <button
                            onClick={() => openAppModal(app)}
                            className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-wide hover:bg-blue-500 hover:text-white transition-all"
                          >
                            View
                          </button>

                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(app.id);
                            }}
                            disabled={deletingId === app.id}
                            className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === app.id ? (
                              <FaSpinner className="animate-spin" size={10} />
                            ) : (
                              <FaTrash size={10} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ─── Expo Application Detail Modal ─────────────────────────────────── */}
      {showAppModal && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10 rounded-t-[2rem]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black">
                  {selectedApp.companyName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">{selectedApp.companyName}</h2>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getAppStatusStyle(selectedApp.status)}`}>
                    {selectedApp.status}
                  </span>
                </div>
              </div>
              <button
                onClick={closeAppModal}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-all"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Contact Info */}
              <section className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Contact Details</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FaUser className="text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Representative</p>
                      <p className="text-sm font-bold text-gray-900">{selectedApp.contactPerson}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Email</p>
                      <a href={`mailto:${selectedApp.email}`} className="text-sm font-bold text-blue-600">{selectedApp.email}</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Phone</p>
                      <a href={`tel:${selectedApp.phone}`} className="text-sm font-bold text-gray-900">{selectedApp.phone}</a>
                    </div>
                  </div>
                  {selectedApp.socialMedia && (
                    <div className="flex items-center gap-3">
                      <FaGlobe className="text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Social</p>
                        <p className="text-sm font-bold text-gray-900">{selectedApp.socialMedia}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Space & Payment */}
              <section className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-4">Space & Payment</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Category</p>
                    <p className="text-sm font-bold text-gray-900">{selectedApp.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Booth Type</p>
                    <p className="text-sm font-bold text-gray-900">{getBoothLabel(selectedApp.boothType)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Payment Plan</p>
                    <p className="text-sm font-bold text-gray-900">{getPaymentLabel(selectedApp.paymentOption || "")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Applied</p>
                    <p className="text-sm font-bold text-gray-900">{new Date(selectedApp.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </section>

              {/* Status Update */}
              <section className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Update Status</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(["pending", "reviewed", "accepted", "rejected"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(s)}
                      disabled={updatingStatus || selectedApp.status === s}
                      className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border disabled:opacity-60 ${
                        selectedApp.status === s
                          ? getAppStatusStyle(s) + " cursor-default"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-500 hover:text-blue-600"
                      }`}
                    >
                      {updatingStatus ? (
                        <FaSpinner className="animate-spin inline mr-1" size={10} />
                      ) : null}
                      {s === "accepted" ? "✓ Accept" : s === "rejected" ? "✗ Reject" : s === "reviewed" ? "👁 Reviewed" : "↩ Pending"}
                    </button>
                  ))}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Internal Notes</label>
                  <textarea
                    value={appNotes}
                    onChange={(e) => setAppNotes(e.target.value)}
                    placeholder="Notes about this applicant..."
                    rows={3}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all text-sm font-medium resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      disabled={updatingStatus}
                      className="bg-blue-500 text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                      {updatingStatus ? "Saving..." : "Save Notes"}
                    </button>
                  </div>
                </div>
              </section>

              {/* Delete */}
              <div className="pt-2 pb-4">
                <button
                  onClick={() => handleDelete(selectedApp.id)}
                  disabled={deletingId === selectedApp.id}
                  className="w-full py-3 rounded-2xl border-2 border-red-200 bg-red-50 text-red-600 font-black text-sm uppercase tracking-wide hover:bg-red-500 hover:text-white hover:border-red-500 transition-all disabled:opacity-50"
                >
                  {deletingId === selectedApp.id ? (
                    <><FaSpinner className="animate-spin inline mr-2" />Deleting...</>
                  ) : (
                    <><FaTrash className="inline mr-2" />Delete This Application</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ScannerLayout>
  );
};

export default ScannerDashboard;
