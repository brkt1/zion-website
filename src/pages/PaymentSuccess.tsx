import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaCalendarAlt, FaCheckCircle, FaDownload, FaMapMarkerAlt, FaSpinner, FaTicketAlt } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { useCommissionSeller, useEvent } from "../hooks/useApi";
import { verifyPayment } from "../services/payment";
import { getTicketByTxRef, saveTicket, updateTicket } from "../services/ticket";
import { sendWhatsAppThankYou } from "../services/whatsapp";
import { logger } from "../utils/logger";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get("tx_ref");
  const quantityParam = searchParams.get("quantity");
  const eventIdParam = searchParams.get("event_id");
  const eventTitleParam = searchParams.get("event_title");
  const commissionSellerIdParam = searchParams.get("commission_seller_id");

  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "failed" | "pending">("loading");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [ticketSaved, setTicketSaved] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const { event } = useEvent(eventIdParam || undefined);
  const validCommissionSellerId = commissionSellerIdParam?.trim() || undefined;
  const { seller: commissionSeller } = useCommissionSeller(validCommissionSellerId);

  const ticketQuantity = useMemo(() => {
    if (quantityParam) {
      const q = parseInt(quantityParam, 10);
      if (!isNaN(q) && q > 0) return q;
    }
    return 1;
  }, [quantityParam]);

  const getCustomerName = (pd: any) =>
    pd?.first_name && pd?.last_name
      ? `${pd.first_name} ${pd.last_name}`
      : pd?.first_name || pd?.last_name || searchParams.get("first_name") || "Guest";

  const getAmount = (pd: any): number => {
    if (!pd?.amount) return 0;
    return typeof pd.amount === "string" ? parseFloat(pd.amount) || 0 : pd.amount;
  };

  const formatDate = (d?: string) =>
    new Date(d || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const formatEventDate = (d?: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
  };

  const shortRef = (ref?: string | null) => (ref || "").substring(0, 8).toUpperCase();

  const qrCodeData = useMemo(() => {
    if (!paymentData) return "";
    return JSON.stringify({
      tx_ref: paymentData.tx_ref || txRef || "",
      amount: getAmount(paymentData),
      currency: paymentData.currency || "ETB",
      date: paymentData.created_at || new Date().toISOString(),
      status: "success",
      quantity: ticketQuantity,
      email: paymentData.email || "",
      name: getCustomerName(paymentData),
      reference: paymentData.reference || paymentData.tx_ref || txRef || "",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentData, txRef, ticketQuantity]);

  // ── Save ticket ────────────────────────────────────────────────────────────
  const saveTicketToDatabase = useCallback(async (pd: any, ref: string | null) => {
    if (!ref || ticketSaved) return;
    try {
      const amount = getAmount(pd);
      const customerName = getCustomerName(pd);
      let quantity = ticketQuantity;
      const qrData = { tx_ref: pd.tx_ref || ref, amount, currency: pd.currency || "ETB", date: pd.created_at || new Date().toISOString(), status: "success", quantity, email: pd.email || "", name: customerName, reference: pd.reference || pd.tx_ref || ref };
      const sellerName = commissionSeller?.name;

      const existing = await getTicketByTxRef(ref);
      if (existing) {
        const needsUpdate = (validCommissionSellerId && existing.commission_seller_id !== validCommissionSellerId) || existing.quantity !== quantity;
        if (needsUpdate) await updateTicket(ref, { commission_seller_id: validCommissionSellerId, commission_seller_name: sellerName, quantity, qr_code_data: qrData });
        setTicketSaved(true);
        return;
      }

      await saveTicket({
        tx_ref: ref,
        event_id: eventIdParam || pd.meta?.event_id || undefined,
        event_title: eventTitleParam || pd.meta?.event_title || undefined,
        customer_name: customerName || undefined,
        customer_email: pd.email || "",
        customer_phone: pd.phone_number || undefined,
        amount,
        currency: pd.currency || "ETB",
        quantity,
        status: "success",
        chapa_reference: pd.reference || undefined,
        commission_seller_id: validCommissionSellerId,
        commission_seller_name: sellerName,
        qr_code_data: qrData,
        payment_date: pd.created_at || new Date().toISOString(),
      });
      setTicketSaved(true);
    } catch (err) {
      console.error("Error saving ticket:", err);
    }
  }, [ticketSaved, ticketQuantity, eventIdParam, eventTitleParam, validCommissionSellerId, commissionSeller]); // eslint-disable-line

  // ── Send WhatsApp ──────────────────────────────────────────────────────────
  const sendWhatsAppMessage = useCallback(async (pd: any, ref: string | null) => {
    if (!ref || whatsappSent || !pd?.phone_number) return;
    try {
      const result = await sendWhatsAppThankYou({ phone_number: pd.phone_number, customer_name: getCustomerName(pd) || undefined, amount: getAmount(pd), currency: pd.currency || "ETB", tx_ref: ref, event_title: eventTitleParam || undefined, quantity: ticketQuantity });
      if (result.success) setWhatsappSent(true);
    } catch (err) { /* non-critical */ }
  }, [whatsappSent, ticketQuantity, eventTitleParam]); // eslint-disable-line

  // ── Verify payment — fast: 1 s retry ──────────────────────────────────────
  useEffect(() => {
    const verify = async (attempt = 0) => {
      if (!txRef) { setVerificationStatus("failed"); return; }

      // Free registration bypass
      if (txRef.startsWith("free_reg_")) {
        const pd = { first_name: searchParams.get("first_name") || "Guest", last_name: searchParams.get("last_name") || "", email: searchParams.get("email") || "", phone_number: searchParams.get("phone") || "", amount: 0, currency: "ETB", status: "success", created_at: new Date().toISOString(), tx_ref: txRef };
        setPaymentData(pd);
        setVerificationStatus("success");
        saveTicketToDatabase(pd, txRef);
        return;
      }

      try {
        const response = await verifyPayment(txRef);
        if (response.success && response.data) {
          setPaymentData(response.data);
          const s = response.data.status?.toLowerCase();
          if (s === "success" || s === "successful" || s === "completed") {
            setVerificationStatus("success");
            saveTicketToDatabase(response.data, txRef);
            sendWhatsAppMessage(response.data, txRef);
          } else if (s === "failed" || s === "cancelled" || s === "canceled") {
            setVerificationStatus("failed");
          } else if ((s === "pending" || s === "processing") && attempt < 4) {
            // Fast retry: 1s, 1.5s, 2s, 2.5s
            setVerificationStatus("pending");
            setTimeout(() => verify(attempt + 1), 1000 + attempt * 500);
          } else {
            setVerificationStatus("failed");
          }
        } else {
          if (attempt < 3) {
            setVerificationStatus("pending");
            setTimeout(() => verify(attempt + 1), 1500);
          } else {
            setVerificationStatus("failed");
          }
        }
      } catch (err: any) {
        logger.warn("Verify error attempt", attempt, err?.message);
        if (attempt < 2) {
          setVerificationStatus("pending");
          setTimeout(() => verify(attempt + 1), 1500);
        } else {
          setVerificationStatus("failed");
        }
      }
    };
    verify();
  }, [txRef]); // eslint-disable-line

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!ticketRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        allowTaint: false,
        onclone: (doc) => {
          doc.querySelectorAll<HTMLElement>("[style*='backdrop-filter']").forEach(el => {
            el.style.backdropFilter = "none";
            el.style.backgroundColor = "rgba(0,0,0,0.5)";
          });
        },
      });
      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, "image/png"));
      if (!blob) throw new Error("blob failed");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = `YENEGE-Ticket-${shortRef(paymentData?.tx_ref || txRef)}.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
    } catch (e) {
      alert("Could not generate ticket image. Please screenshot this page.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Event metadata helpers ─────────────────────────────────────────────────
  const eventImage = event?.image || (event?.gallery && event.gallery[0]) || "";
  const eventTitle = eventTitleParam || event?.title || "Event";
  const eventDate = event?.date ? formatEventDate(event.date) : "";
  const eventTime = event?.time || "";
  const eventLocation = event?.location || "";
  const amount = getAmount(paymentData);
  const customerName = getCustomerName(paymentData);
  const payDate = formatDate(paymentData?.created_at);

  // ── Loading / Pending ──────────────────────────────────────────────────────
  if (verificationStatus === "loading" || verificationStatus === "pending") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)" }} className="flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-yellow-400 animate-spin" />
            <FaTicketAlt className="absolute inset-0 m-auto text-yellow-400 text-2xl" />
          </div>
          <h1 className="text-white text-2xl font-black mb-3" style={{ fontFamily: "'Playfair Display',serif" }}>
            {verificationStatus === "pending" ? "Almost Ready…" : "Verifying Payment"}
          </h1>
          <p className="text-white/50 text-sm font-medium">Confirming your payment with Chapa…</p>
          <div className="flex justify-center gap-1.5 mt-6">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Failed ─────────────────────────────────────────────────────────────────
  if (verificationStatus === "failed") {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc" }} className="flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-500 text-3xl">✕</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3" style={{ fontFamily: "'Playfair Display',serif" }}>Verification Failed</h1>
          <p className="text-gray-500 text-sm mb-6">We couldn't confirm your payment. Please contact support.</p>
          {txRef && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Reference ID</p>
              <p className="text-xs font-mono text-gray-900 break-all">{txRef}</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button onClick={() => window.location.reload()} className="w-full py-3 rounded-2xl font-black text-sm text-white" style={{ background: "linear-gradient(135deg,#FFD447,#FF6F5E)" }}>
              Retry Verification
            </button>
            <Link to="/contact" className="w-full py-3 rounded-2xl font-bold text-sm text-gray-700 border border-gray-200 text-center block">Contact Support</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0f172a 0%,#1a1035 50%,#0f172a 100%)" }} className="py-8 px-4 flex flex-col items-center">
      {/* Top success badge */}
      <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
        <FaCheckCircle className="text-green-400 text-sm" />
        <span className="text-green-300 text-xs font-bold uppercase tracking-widest">Payment Confirmed</span>
      </div>

      {/* ── THE TICKET CARD (downloadable) ── */}
      <div ref={ticketRef} className="w-full max-w-[380px] rounded-[36px] overflow-hidden shadow-2xl" style={{ background: "#0f172a", fontFamily: "'Manrope',system-ui,sans-serif" }}>

        {/* Event Image Header */}
        <div className="relative h-52 overflow-hidden">
          {eventImage ? (
            <img src={eventImage} alt={eventTitle} className="w-full h-full object-cover" crossOrigin="anonymous" />
          ) : (
            <div style={{ background: "linear-gradient(135deg,#FFD447 0%,#FF6F5E 100%)" }} className="w-full h-full" />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)" }} />

          {/* YENEGE logo + status badge */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <img src="/logo.png" alt="YENEGE" className="h-7 w-auto brightness-0 invert" crossOrigin="anonymous" />
            <div className="flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[10px] font-black uppercase tracking-widest">Confirmed</span>
            </div>
          </div>

          {/* Event title over image */}
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-white font-black text-xl leading-tight" style={{ fontFamily: "'Playfair Display',serif", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              {eventTitle}
            </h1>
          </div>
        </div>

        {/* Ticket tear line */}
        <div className="relative h-5 flex items-center" style={{ background: "#0f172a" }}>
          <div className="absolute -left-3 w-6 h-6 rounded-full" style={{ background: "linear-gradient(160deg,#0f172a,#1a1035)" }} />
          <div className="flex-1 mx-3 border-t-2 border-dashed border-white/10" />
          <div className="absolute -right-3 w-6 h-6 rounded-full" style={{ background: "linear-gradient(160deg,#0f172a,#1a1035)" }} />
        </div>

        {/* Ticket body */}
        <div className="px-6 pb-7 pt-2" style={{ background: "#0f172a" }}>

          {/* Event meta */}
          {(eventDate || eventLocation) && (
            <div className="space-y-2 mb-5">
              {eventDate && (
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <FaCalendarAlt className="text-yellow-400 flex-shrink-0" size={11} />
                  <span>{eventDate}{eventTime && ` · ${eventTime}`}</span>
                </div>
              )}
              {eventLocation && (
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <FaMapMarkerAlt className="text-yellow-400 flex-shrink-0" size={11} />
                  <span className="truncate">{eventLocation}</span>
                </div>
              )}
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/5 rounded-2xl p-3">
              <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Holder</p>
              <p className="text-white text-sm font-black leading-tight truncate">{customerName}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3">
              <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Date Issued</p>
              <p className="text-white text-sm font-black">{payDate}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3">
              <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Tickets</p>
              <p className="text-white text-sm font-black">{ticketQuantity}×</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3">
              <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Amount</p>
              <p className="text-yellow-400 text-sm font-black">
                {amount > 0 ? `${amount.toLocaleString()} ${paymentData?.currency || "ETB"}` : "Free"}
              </p>
            </div>
          </div>

          {/* Ref + QR */}
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-white/25 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Ref</p>
              <p className="text-white/70 text-[10px] font-mono font-bold truncate">{shortRef(paymentData?.tx_ref || txRef)}</p>
              <p className="text-white/25 text-[9px] mt-3 leading-relaxed">
                Show QR at entrance.<br />Valid for {ticketQuantity} person{ticketQuantity !== 1 ? "s" : ""}.
              </p>
            </div>
            {qrCodeData && (
              <div className="p-3 bg-white rounded-2xl flex-shrink-0 shadow-xl">
                <QRCode value={qrCodeData} size={90} level="M" fgColor="#000" bgColor="#fff" />
              </div>
            )}
          </div>

          {/* Gold security strip */}
          <div className="mt-6 h-1 rounded-full" style={{ background: "linear-gradient(90deg,transparent,#FFD447,transparent)" }} />
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="w-full max-w-[380px] mt-5 flex flex-col gap-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg,#FFD447 0%,#FF6F5E 100%)", color: "#0f172a", boxShadow: "0 8px 30px rgba(255,111,94,0.35)" }}
        >
          {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
          {isDownloading ? "Generating…" : "Download Ticket"}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/events" className="py-3 rounded-2xl font-bold text-xs text-white/70 border border-white/10 text-center hover:bg-white/5 transition-all">
            Browse Events
          </Link>
          <Link to="/" className="py-3 rounded-2xl font-bold text-xs text-white/70 border border-white/10 text-center hover:bg-white/5 transition-all">
            Go Home
          </Link>
        </div>

        <p className="text-center text-white/25 text-[11px] mt-2 px-4">
          A confirmation has been sent to {paymentData?.email || "your email"}. Save or screenshot your ticket.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
