import { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaMapMarkerAlt, FaSpinner, FaTelegram, FaTimes, FaUsers, FaWhatsapp } from "react-icons/fa";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../Components/Gallery.css";
import { EventDetailSkeleton } from "../Components/ui/EventDetailSkeleton";
import { LocationButton } from "../Components/ui/LocationButton";
import OptimizedImage from "../Components/ui/OptimizedImage";
import ShatterSlideshow from "../Components/ui/ShatterSlideshow";
import { useActiveCommissionSellers, useContactInfo, useEvent } from "../hooks/useApi";
import { useLanguage } from "../contexts/LanguageContext";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { generateTransactionReference, getChapaPublicKey, initializePayment, submitChapaHTMLCheckout } from "../services/payment";
import { registerForFreeEvent } from "../services/ticket";
import { BRAND } from "../styles/theme";
import { PaymentRequest } from "../types";

const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { event, isLoading, mutate: refetchEvent } = useEvent(id);
  const { t, language } = useLanguage();
  
  // Initialize scroll reveal animations
  useScrollReveal();
  
  const { contactInfo } = useContactInfo();
  const { sellers: allSellers } = useActiveCommissionSellers();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationSuccess] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState<number | null>(null);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null);
  const [chapaPublicKey, setChapaPublicKey] = useState<string | null>(null);
  const [isLoadingPublicKey, setIsLoadingPublicKey] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    quantity: 1,
    commission_seller_id: searchParams.get('seller') || "",
  });

  // Filter commission sellers based on event's allowed sellers - memoized for performance
  // Only show discounts if event has allowed_commission_seller_ids configured
  const commissionSellers = useMemo(() => {
    if (!event || !allSellers.length) return [];
    
    // Only show discounts if event has allowed_commission_seller_ids configured
    // If no allowed sellers are set, don't show any discounts
    if (!event.allowed_commission_seller_ids || event.allowed_commission_seller_ids.length === 0) {
      return [];
    }
    
    // Filter to only allowed sellers that have discounts configured
    return allSellers.filter(seller => 
      event.allowed_commission_seller_ids!.includes(seller.id) &&
      seller.discount_rate && 
      seller.discount_type
    );
  }, [event, allSellers]);

  // Memoize selected seller lookup for performance
  const selectedSeller = useMemo(() => {
    if (!paymentForm.commission_seller_id || !commissionSellers.length) return null;
    return commissionSellers.find(s => s.id === paymentForm.commission_seller_id) || null;
  }, [paymentForm.commission_seller_id, commissionSellers]);

  // Check if we have multiple ticket types (e.g. "VIP: 1000, Regular: 500")
  const ticketTypes = useMemo(() => {
    if (!event || event.price === "Free" || event.price?.toLowerCase() === "free" || event.price === "0" || parseFloat(event.price.toString().replace(/[^0-9.]/g, '') || '0') === 0) return [];
    
    if (event.price.includes(':') && event.price.includes(',')) {
      try {
        return event.price.split(',').map(type => {
          const [name, priceStr] = type.split(':').map(s => s.trim());
          const price = parseFloat(priceStr.replace(/[^0-9.]/g, '') || '0');
          return { name, price, originalString: type.trim() };
        });
      } catch (e) {
        return [];
      }
    } else if (event.price.includes(':')) {
       try {
        const [name, priceStr] = event.price.split(':').map(s => s.trim());
        const price = parseFloat(priceStr.replace(/[^0-9.]/g, '') || '0');
        return [{ name, price, originalString: event.price.trim() }];
      } catch (e) {
        return [];
      }
    }
    return [];
  }, [event]);

  const [selectedTicketTypeIndex, setSelectedTicketTypeIndex] = useState(0);

  // Memoize base price calculation
  const basePrice = useMemo(() => {
    if (!event) return 0;
    if (event.price === "Free" || event.price?.toLowerCase() === "free") return 0;
    
    if (ticketTypes.length > 0) {
      return ticketTypes[selectedTicketTypeIndex]?.price || 0;
    }
    
    return parseFloat(event.price.toString().replace(/[^0-9.]/g, '') || '0');
  }, [event, ticketTypes, selectedTicketTypeIndex]);

  // Memoize discount calculation for performance
  const discountCalculation = useMemo(() => {
    if (!selectedSeller || !selectedSeller.discount_rate || !selectedSeller.discount_type || basePrice === 0 || !event) {
      return { discountAmount: 0, discountText: '', selectedSeller: null };
    }

    const quantity = paymentForm.quantity || 1;
    const subtotal = basePrice * quantity;
    let discountAmount = 0;

    if (selectedSeller.discount_type === 'percentage') {
      discountAmount = (subtotal * selectedSeller.discount_rate) / 100;
    } else {
      // Fixed discount per ticket
      discountAmount = selectedSeller.discount_rate * quantity;
    }

    // Don't allow discount to exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    const discountText = selectedSeller.discount_type === 'percentage'
      ? `${selectedSeller.discount_rate}% off`
      : `${selectedSeller.discount_rate} ${event.currency} off`;

    return { discountAmount, discountText, selectedSeller };
  }, [selectedSeller, basePrice, paymentForm.quantity, event]);

  // Helper function to calculate discount (uses memoized result when possible)
  // Helper function removed as it was unused and identical logic is memoized in discountCalculation

  // Pre-fetch Chapa public key when payment modal opens (for faster checkout)
  // Also check localStorage cache immediately for instant access
  useEffect(() => {
    if (showPaymentModal) {
      // Check localStorage cache first (instant, no network call)
      if (typeof window !== 'undefined' && window.localStorage && !chapaPublicKey) {
        try {
          const cached = localStorage.getItem('chapa_public_key');
          if (cached) {
            const { key, timestamp } = JSON.parse(cached);
            // Use cached key if less than 24 hours old
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
              setChapaPublicKey(key);
              return; // Already have key, no need to fetch
            }
          }
        } catch (e) {
          // Ignore cache errors, continue to fetch
        }
      }

      // Fetch from server if not cached or cache expired
      if (!chapaPublicKey && !isLoadingPublicKey) {
        setIsLoadingPublicKey(true);
        getChapaPublicKey()
          .then((key) => {
            setChapaPublicKey(key);
            setIsLoadingPublicKey(false);
          })
          .catch((error) => {
            console.warn('Failed to pre-fetch public key, will try on submit:', error);
            setIsLoadingPublicKey(false);
            // Don't set error state - we'll fall back to API on submit
          });
      }
    }
  }, [showPaymentModal, chapaPublicKey, isLoadingPublicKey]);

  // Handle rate limit countdown timer
  useEffect(() => {
    if (rateLimitCountdown === null || rateLimitCountdown <= 0) {
      if (rateLimitCountdown === 0) {
        setRateLimitCountdown(null);
      }
      return;
    }

    const timer = setInterval(() => {
      setRateLimitCountdown((prev) => {
        if (prev === null || prev <= 1) {
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitCountdown]);

  // Handle keyboard navigation for fullscreen gallery and prevent body scroll
  useEffect(() => {
    if (fullscreenImageIndex === null || !event?.gallery) {
      document.body.style.overflow = '';
      return;
    }

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreenImageIndex(null);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFullscreenImageIndex((prev) => {
          if (prev === null) return null;
          return prev > 0 ? prev - 1 : event.gallery!.length - 1;
        });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFullscreenImageIndex((prev) => {
          if (prev === null) return null;
          return prev < event.gallery!.length - 1 ? prev + 1 : 0;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [fullscreenImageIndex, event?.gallery]);


  // Show skeleton loading while loading or if event is not available yet
  // The hook will keep retrying automatically until event loads
  if (isLoading || !event) {
    return <EventDetailSkeleton />;
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit directly to payment - no need for payment method selection
    // Chapa will show all available payment methods on their checkout page
    await handlePayment();
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Calculate total amount based on quantity - use memoized discount calculation
      const quantity = paymentForm.quantity || 1;
      const { discountAmount } = discountCalculation;
      const subtotal = basePrice * quantity;
      const totalAmount = Math.max(0, subtotal - discountAmount).toFixed(2);

      // Validate calculation
      if (basePrice <= 0 && event.price !== "Free") {
        alert('Invalid event price. Please contact support.');
        setIsProcessing(false);
        return;
      }

      if (quantity <= 0) {
        alert('Please select at least 1 ticket.');
        setIsProcessing(false);
        return;
      }

      // Generate transaction reference on frontend
      const txRef = generateTransactionReference('YENEGE', 20);

      // Try HTML checkout first, fall back to API initialization if public key endpoint is not available
      try {
        // Use pre-fetched public key if available, otherwise fetch it now
        let publicKey = chapaPublicKey;
        if (!publicKey) {
          // Try to get it quickly (should be cached or fast)
          publicKey = await getChapaPublicKey();
          setChapaPublicKey(publicKey); // Cache it for next time
        }

        // Build callback and return URLs
        const frontendUrl = window.location.origin;
        const callbackUrl = `${frontendUrl}/payment/callback`;
        const returnUrlParams = new URLSearchParams();
        returnUrlParams.set('tx_ref', txRef);
        returnUrlParams.set('event_id', event.id);
        returnUrlParams.set('event_title', event.title);
        returnUrlParams.set('quantity', quantity.toString());
        if (ticketTypes.length > 1 && ticketTypes[selectedTicketTypeIndex]) {
          returnUrlParams.set('ticket_type', ticketTypes[selectedTicketTypeIndex].name);
        }
        if (paymentForm.commission_seller_id) {
          returnUrlParams.set('commission_seller_id', paymentForm.commission_seller_id);
        }
        const returnUrl = `${frontendUrl}/payment/success?${returnUrlParams.toString()}`;

        // Sanitize event title for Chapa (only letters, numbers, hyphens, underscores, spaces, and dots)
        const sanitizeTitle = (text: string): string => {
          return text.replace(/[^a-zA-Z0-9_\s.-]/g, '').trim();
        };
        const sanitizedTitle = sanitizeTitle(event.title);
        const title = sanitizedTitle.length > 16 ? sanitizedTitle.substring(0, 16) : sanitizedTitle;
        const description = sanitizeTitle(`Payment for ${sanitizedTitle || 'event registration'}`);

        // Submit HTML checkout form immediately (non-blocking)
        // This is instant - no waiting for server response
        submitChapaHTMLCheckout({
          publicKey,
          txRef,
          amount: totalAmount,
          currency: event.currency,
          email: paymentForm.email,
          first_name: paymentForm.first_name,
          last_name: paymentForm.last_name,
          phone_number: paymentForm.phone_number,
          title: title || undefined,
          description: description || undefined,
          callback_url: callbackUrl,
          return_url: returnUrl,
          meta: {
            event_id: event.id,
            event_title: event.title,
            quantity: quantity.toString(),
            ...(ticketTypes.length > 1 && ticketTypes[selectedTicketTypeIndex] && { ticket_type: ticketTypes[selectedTicketTypeIndex].name }),
            ...(paymentForm.commission_seller_id && { commission_seller_id: paymentForm.commission_seller_id }),
          },
        });

        // Form submission redirects immediately, so we don't need to set isProcessing to false
        // The page will redirect to Chapa's payment page
        return;
      } catch (htmlCheckoutError: any) {
        // If HTML checkout fails (e.g., public key endpoint not available), fall back to API initialization
        console.warn('HTML checkout not available, falling back to API initialization:', htmlCheckoutError.message);
        
        // Fall back to the original API initialization method
        const paymentData: PaymentRequest = {
          first_name: paymentForm.first_name,
          last_name: paymentForm.last_name,
          email: paymentForm.email,
          phone_number: paymentForm.phone_number,
          currency: event.currency,
          amount: totalAmount,
          quantity: quantity,
          event_id: event.id,
          event_title: event.title,
          commission_seller_id: paymentForm.commission_seller_id || undefined,
          ticket_type: (ticketTypes.length > 1 && ticketTypes[selectedTicketTypeIndex]) ? ticketTypes[selectedTicketTypeIndex].name : undefined,
          tx_ref: txRef,
        };

        const response = await initializePayment(paymentData);

        if (response.success && response.data?.checkout_url) {
          // Redirect to Chapa checkout
          window.location.href = response.data.checkout_url;
        } else {
          // Show error message
          const errorMsg = response.message || "Failed to initialize payment";
          
          if (response.error === 'LOCALHOST_URL_NOT_ALLOWED') {
            alert(
              "⚠️ URL Configuration Error\n\n" +
              errorMsg + "\n\n" +
              (response.suggestion || "Production payments require HTTPS URLs. Please ensure your FRONTEND_URL is configured correctly.")
            );
          } else {
            alert(errorMsg + (response.suggestion ? "\n\n" + response.suggestion : ""));
          }
          setIsProcessing(false);
        }
        return;
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      console.error("Error details:", {
        message: error.message,
        error: error.error,
        status: error.status,
        details: error.details,
        suggestion: error.suggestion,
      });
      
      // Extract error message from various possible locations
      const errorMsg = 
        error.message || 
        error.details?.message ||
        (typeof error.error === 'string' ? error.error : null) ||
        error.toString?.() ||
        "An error occurred. Please try again.";
      const errorType = error.error?.code || error.error || (error.status ? 'HTTP_ERROR' : 'UNKNOWN_ERROR');
      
      // Check if it's a rate limit error
      if (errorType === 'RATE_LIMIT_EXCEEDED' || errorMsg.includes("Rate limit") || errorMsg.includes("try again in")) {
        const retryTime = error.retryAfter || parseInt(errorMsg.match(/(\d+)\s*seconds?/i)?.[1] || '30', 10);
        // Start countdown timer
        setRateLimitCountdown(retryTime);
      }
      // Check if it's a public key endpoint error
      else if (errorMsg.includes("Public key endpoint not found") || errorMsg.includes("public key")) {
        alert(
          "⚠️ Configuration Error\n\n" +
          "The payment system is not fully configured yet. The server may need to be restarted with the latest code.\n\n" +
          "Please contact support or try again later."
        );
      }
      // Check if it's a validation error
      else if (errorType === 'VALIDATION_ERROR' || errorMsg.includes("Validation error")) {
        alert(
          "⚠️ Validation Error\n\n" +
          errorMsg + "\n\n" +
          "Please check your input and try again."
        );
      }
      // Check if it's an API key error
      else if (errorType === 'INVALID_API_KEY' || errorMsg.includes("Invalid API Key") || errorMsg.includes("can't accept payments")) {
        alert(
          "⚠️ Invalid Chapa API Key\n\n" +
          errorMsg + "\n\n" +
          (error.suggestion || "Please verify your CHAPA_SECRET_KEY in server/.env and ensure your Chapa account is active.")
        );
      }
      // Check if it's a localhost URL error
      else if (errorMsg.includes("localhost") || errorType === "LOCALHOST_URL_NOT_ALLOWED" || errorType === "URL_VALIDATION_ERROR") {
        alert(
          "⚠️ URL Configuration Error\n\n" +
          errorMsg + "\n\n" +
          (error.suggestion || "Production payments require HTTPS URLs. Please ensure your FRONTEND_URL is configured correctly.")
        );
      } else {
        alert(errorMsg + (error.suggestion ? "\n\n" + error.suggestion : ""));
      }
      setIsProcessing(false);
    }
  };

  const handleFreeEventRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !id) return;

    setIsProcessing(true);
    try {
      const customerName = `${paymentForm.first_name} ${paymentForm.last_name}`.trim();
      
      if (!customerName || !paymentForm.email || !paymentForm.phone_number) {
        alert('Please fill in all required fields.');
        setIsProcessing(false);
        return;
      }

      // Free events: always 1 seat per person — quantity is locked to 1
      await registerForFreeEvent(
        id,
        event.title,
        customerName,
        paymentForm.email,
        paymentForm.phone_number,
        1
      );

      // Refresh event data to update attendee count
      refetchEvent();
      
      // Generate a special tx_ref for free registrations
      const freeTxRef = generateTransactionReference('FREE', 10);
      
      // Build success URL with all necessary parameters for the ticket
      const successParams = new URLSearchParams();
      successParams.set('tx_ref', `free_reg_${freeTxRef}`);
      successParams.set('event_id', id);
      successParams.set('event_title', event.title);
      successParams.set('quantity', '1'); // Free events are always 1 seat per person
      successParams.set('first_name', paymentForm.first_name);
      successParams.set('last_name', paymentForm.last_name);
      successParams.set('email', paymentForm.email);
      successParams.set('phone', paymentForm.phone_number);
      
      // Redirect to Telegram if exists, but after the success page is visible or handled
      // Actually, standard behavior should be to show the ticket first
      
      navigate(`/payment/success?${successParams.toString()}`);
      
      // Reset states
      setShowRegistrationModal(false);
      setIsProcessing(false);
    } catch (error: any) {
      console.error('Registration error:', error);
      const msg: string = error.message || 'Failed to register. Please try again.';
      if (msg.startsWith('EVENT_FULL:')) {
        alert('🚫 ' + msg.replace('EVENT_FULL:', '').trim());
      } else {
        alert(msg);
      }
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name;
    let value: string | number = e.target.value;
    
    // Handle quantity as a number
    if (name === 'quantity') {
      const numValue = parseInt(e.target.value, 10);
      // Only update if it's a valid positive number, otherwise keep current value
      if (!isNaN(numValue) && numValue > 0) {
        value = numValue;
      } else if (e.target.value === '') {
        // Allow empty temporarily while user is typing
        value = 1; // Default to 1 if empty
      } else {
        // Invalid input, don't update
        return;
      }
    }
    
    setPaymentForm({
      ...paymentForm,
      [name]: value,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const shareUrl = window.location.href;
  const shareText = `Check out this event: ${event.title}`;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D4AF37] selection:text-white pb-24">
      {/* ── Global Style Injections ────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap');

        .ed-font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .ed-font-sans  { font-family: 'Manrope', system-ui, sans-serif; }

        .ed-hero-overlay {
          background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.95) 100%);
        }

        .ed-sidebar-card {
          background: #0A0A0A;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 28px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.7);
        }

        .ed-info-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(255,0,51,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D4AF37;
        }

        .ed-btn-primary {
          background: #D4AF37;
          color: #ffffff;
          border-radius: 100px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s;
          box-shadow: 0 10px 25px rgba(255,0,51,0.3);
        }
        .ed-btn-primary:hover {
          background: #F5BD42;
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(255,0,51,0.45);
        }

        .ed-gallery-img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ed-gallery-item:hover .ed-gallery-img {
          transform: scale(1.08);
        }

        .ed-back-btn {
          color: rgba(255,255,255,0.8);
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
        }
        .ed-back-btn:hover {
          color: #D4AF37;
          transform: translateX(-4px);
        }
      `}</style>

      {/* ── TOP EVENT DISCOVERY & EVENTJOBS CALLOUT ──────────────────────── */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white">
                Discover More Live Events &amp; EventJobs
              </p>
              <p className="text-[11px] text-white/50">
                Explore real-time tickets, schedules, and job openings on Ethiopia's primary hub.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <a
              href="https://yenege.events"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#F5BD42] text-white text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-[#D4AF37]/20"
            >
              <span>Explore yenege.events</span>
              <FaExternalLinkAlt size={10} />
            </a>
            <a
              href="https://yenege.events"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-black tracking-wider uppercase transition-all"
            >
              <span>EventJobs</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── 1. Hero Section ────────────────────────────────────────────────── */}
      <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden bg-black">
        {event.image && (
          <div className="absolute inset-0">
            <OptimizedImage
              src={event.image}
              alt={event.title}
              width={1920}
              height={1080}
              className="h-full w-full object-cover opacity-90"
              priority="high"
            />
            <div className="ed-hero-overlay absolute inset-0" />
          </div>
        )}

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12">
          <button 
            onClick={() => navigate(-1)}
            className="ed-back-btn mb-auto mt-8 sm:mt-12"
          >
            <FaChevronLeft size={14} /> {language === 'am' ? 'ወደ ኢቨንቶች ተመለስ' : language === 'om' ? 'Gara Qophiiwwaniiti Deebi\'aa' : 'Back to Events'}
          </button>

          <div className="max-w-3xl reveal-wrapper">
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/15 backdrop-blur-md border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-black uppercase tracking-widest">
                {event.category}
              </span>
            </div>
            <h1 className="ed-font-serif text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              {event.title}
            </h1>
          </div>
        </div>
      </section>

      {/* ── 2. Content Grid ────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-24">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 flex flex-col gap-8 sm:gap-12">
            
            {/* Quick Info Bar */}
            <div className="bg-[#0A0A0A] rounded-[28px] p-6 sm:p-8 border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 reveal-wrapper reveal-delay-300">
              <div className="flex items-center gap-4">
                <div className="ed-info-icon-wrap">
                  <FaCalendarAlt size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">
                    {language === 'am' ? 'ቀን እና ሰዓት' : language === 'om' ? 'Guyyaa fi Sa\'aatii' : 'Date & Time'}
                  </div>
                  <div className="ed-font-sans font-bold text-white truncate">{formatDate(event.date)}</div>
                  {event.time && <div className="text-xs text-white/50">{event.time}</div>}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="ed-info-icon-wrap">
                  <FaMapMarkerAlt size={20} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">
                    {t.eventsPage.location || (language === 'am' ? 'ቦታ' : language === 'om' ? 'Bakka' : 'Location')}
                  </div>
                  <div className="ed-font-sans font-bold text-white">
                    <LocationButton location={event.location} className="hover:text-[#D4AF37] transition-colors truncate block" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="ed-info-icon-wrap">
                  <FaUsers size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">
                    {language === 'am' ? 'የቦታ ሁኔታ' : language === 'om' ? 'Bakka Hafe' : 'Availability'}
                  </div>
                  <div className={`ed-font-sans font-bold ${
                    event.maxAttendees && (event.attendees || 0) >= event.maxAttendees
                      ? 'text-[#D4AF37]'
                      : 'text-white'
                  }`}>
                    {event.attendees || 0} {event.maxAttendees ? `${language === 'am' ? 'ከ' : language === 'om' ? 'keessaa' : 'of'} ${event.maxAttendees}` : (language === 'am' ? 'ተመዝግበዋል' : language === 'om' ? 'galmaa\'aniiru' : 'joined')}
                  </div>
                  {event.maxAttendees && (
                    <div className={`text-xs font-medium ${
                      (event.attendees || 0) >= event.maxAttendees
                        ? 'text-[#D4AF37] font-bold'
                        : 'text-white/70'
                    }`}>
                      {(event.attendees || 0) >= event.maxAttendees
                        ? (language === 'am' ? '🚫 ቦታዎች ተሞልተዋል' : language === 'om' ? '🚫 Qophiin kun guuteera' : '🚫 Event is full')
                        : `${Math.max(0, event.maxAttendees - (event.attendees || 0))} ${language === 'am' ? 'ቦታዎች ቀርተዋል' : language === 'om' ? 'bakka hafe' : 'spots left'}`
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About Section */}
            <div>
              <h2 className="ed-font-serif text-3xl font-bold text-white mb-6">
                {language === 'am' ? 'የኢቨንቱ ዋና ዋና ይዘቶች' : language === 'om' ? 'Waa\'ee Qophii Kanaa' : 'Experience Highlights'}
              </h2>
              <div className="ed-font-sans text-base text-white/70 leading-relaxed whitespace-pre-line bg-[#0A0A0A] p-8 rounded-[28px] border border-white/10">
                {event.description}
              </div>
            </div>

          </div>

          {/* Sidebar / Booking Area */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 flex flex-col gap-6">
              {/* Perspective Series - Now in Sidebar */}
              {event.gallery && event.gallery.length > 0 && (
                <div className="space-y-4 reveal-wrapper">
                  <div className="flex items-center gap-3 px-2">
                    <div className="h-px flex-1 bg-white/10" />
                    <h4 className="ed-font-serif text-lg font-black text-white italic">
                      {language === 'am' ? 'የፎቶ ማህደር' : language === 'om' ? 'Suuraawwan Qophii' : 'Perspective Series'}
                    </h4>
                    <div className="h-px w-8 bg-white/10" />
                  </div>
                  <ShatterSlideshow images={event.gallery} />
                </div>
              )}

              <div className="ed-sidebar-card p-8 md:p-10 reveal-wrapper reveal-delay-200">
                <div className="flex justify-between items-baseline mb-8">
                  <div>
                    <span className="text-[11px] font-extrabold text-white/40 uppercase tracking-[0.2em] block mb-1">
                      {language === 'am' ? 'የመግቢያ ክፍያ' : language === 'om' ? 'Kaffaltii Seensaa' : 'Admission Fee'}
                    </span>
                    <div className="ed-font-serif text-4xl font-black text-white">
                      {event.price === "Free" || event.price === "0" ? t.eventsPage.free : ticketTypes.length > 1 ? `${language === 'am' ? 'ከ ' : language === 'om' ? 'Irraa ' : 'From '}${Math.min(...ticketTypes.map(t => t.price))}` : `${event.price}`}
                      {event.price !== "Free" && event.price !== "0" && <span className="text-lg ml-1 opacity-60 font-medium">{event.currency || 'ETB'}</span>}
                    </div>
                  </div>
                  <div className="w-12 h-0.5 bg-[#D4AF37]/40 rounded-full" />
                </div>

                <div className="space-y-4 mb-8">
                  {(() => {
                    const isFree = event.price === "Free" || event.price?.toLowerCase() === "free" || event.price === "0" || parseFloat(event.price.toString().replace(/[^0-9.]/g, '') || '0') === 0;
                    const isCommunity = event.category === 'community';
                    const hasSocialLink = event.social_media_link && event.social_media_link.trim() !== '';
                    
                    if (event.is_registration_open === false) {
                      return (
                        <div className="flex flex-col gap-3">
                          <div className="w-full py-5 flex flex-col items-center justify-center gap-2 bg-[#050505] border border-white/10 rounded-full text-center">
                            <span className="text-white/60 font-black text-sm uppercase tracking-widest">
                              🔒 {language === 'am' ? 'ምዝገባ ተዘጋል' : language === 'om' ? 'Galmeen Cufameera' : 'Registration Closed'}
                            </span>
                            <span className="text-white/40 text-xs font-medium">
                              {language === 'am' ? 'ለዚህ ኢቨንት ምዝገባ በአሁኑ ወቅት ተቁሟል።' : language === 'om' ? 'Qophii kanaaf galmeen cufameera.' : 'This event is currently not accepting registrations.'}
                            </span>
                          </div>
                          {hasSocialLink && (
                            <a
                              href={event.social_media_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-white/5 border border-white/15 text-white py-4 rounded-full text-xs font-black uppercase tracking-widest text-center hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                              {language === 'am' ? 'ውይይቱን ይቀላቀሉ' : language === 'om' ? 'Mariitti Makamaa' : 'Join Discussion'} <FaExternalLinkAlt size={12} />
                            </a>
                          )}
                        </div>
                      );
                    }

                    if (isFree || isCommunity) {
                      const isFull = !!(event.maxAttendees && (event.attendees || 0) >= event.maxAttendees);

                      if (isFull) {
                        return (
                          <div className="flex flex-col gap-3">
                            <div className="w-full py-5 flex flex-col items-center justify-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-center">
                              <span className="text-[#D4AF37] font-black text-sm uppercase tracking-widest">
                                🚫 {language === 'am' ? 'ቦታው ሙሉ በሙሉ ተሞልቷል' : language === 'om' ? 'Qophiin Kun Guuteera' : 'This Event Is Full'}
                              </span>
                              <span className="text-white/50 text-xs font-medium">
                                {language === 'am' ? 'እባክዎ የሚቀጥለውን ኢቨንት ይጠብቁ!' : language === 'om' ? 'Maaloo qophii itti aanu eegaa!' : 'Please look for our next event!'}
                              </span>
                            </div>
                            {hasSocialLink && (
                              <a
                                href={event.social_media_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-white/5 border border-white/15 text-white py-4 rounded-full text-xs font-black uppercase tracking-widest text-center hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                              >
                                {language === 'am' ? 'ውይይቱን ይቀላቀሉ' : language === 'om' ? 'Mariitti Makamaa' : 'Join Discussion'} <FaExternalLinkAlt size={12} />
                              </a>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-3">
                          <button 
                            onClick={() => setShowRegistrationModal(true)}
                            className="ed-btn-primary w-full py-5 flex items-center justify-center gap-3 disabled:opacity-50"
                            disabled={isProcessing}
                          >
                            {isProcessing ? <FaSpinner className="animate-spin" /> : (language === 'am' ? 'ቦታዬን ላስይዝ' : language === 'om' ? 'Bakka Koos Qabadha' : 'Secure My Spot')}
                          </button>
                          {hasSocialLink && (
                            <a
                              href={event.social_media_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-white/5 border border-white/15 text-white py-4 rounded-full text-xs font-black uppercase tracking-widest text-center hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                              {language === 'am' ? 'ውይይቱን ይቀላቀሉ' : language === 'om' ? 'Mariitti Makamaa' : 'Join Discussion'} <FaExternalLinkAlt size={12} />
                            </a>
                          )}
                        </div>
                      );
                    }
                    
                    return (
                      <button 
                        onClick={() => setShowPaymentModal(true)}
                        className="ed-btn-primary w-full py-5 flex items-center justify-center gap-3 disabled:opacity-50"
                        disabled={isProcessing}
                      >
                        {isProcessing ? <FaSpinner className="animate-spin" /> : (language === 'am' ? 'መግቢያ ቲኬት ያዝ' : language === 'om' ? 'Tiikeetii Seensaa Qabadhaa' : 'Reserve Admission')}
                      </button>
                    );
                  })()}
                </div>

                {/* Benefits / Social Share */}
                <div className="pt-8 border-t border-white/10">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">
                    {language === 'am' ? 'ለሌሎች ያካፍሉ' : language === 'om' ? 'Hiriyootaaf Qoodaa' : 'Share Experience'}
                  </h4>
                  <div className="flex gap-3">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 h-12 rounded-2xl bg-white/5 text-white flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-all border border-white/10"
                    >
                      <FaWhatsapp size={20} />
                    </a>
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 h-12 rounded-2xl bg-white/5 text-white flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-all border border-white/10"
                    >
                      <FaTelegram size={20} />
                    </a>
                  </div>
                </div>

                {/* Support Link */}
                <div className="mt-8 bg-black rounded-2xl p-5 border border-white/10">
                  <p className="text-xs text-white/60 mb-3 font-medium">
                    {language === 'am' ? 'ስለዚህ ዝግጅት ጥያቄ አለዎት?' : language === 'om' ? 'Waa\'ee qophii kanaa gaaffii qabduu?' : 'Have inquiries regarding this curation?'}
                  </p>
                  <a
                    href={`https://wa.me/${contactInfo?.phone?.replace(/\D/g, '') || '251978639887'}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-extrabold text-white uppercase tracking-widest flex items-center gap-2 hover:text-[#D4AF37] transition-colors"
                  >
                    {language === 'am' ? 'በዋትስአፕ ያናግሩን' : language === 'om' ? 'WhatsApp-iin Nu Quunnamaa' : 'Connect via WhatsApp'} <FaChevronRight size={10} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-start sm:items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-[#0A0A0A] border border-white/15 rounded-[32px] max-w-2xl w-full max-h-[95vh] overflow-y-auto p-8 sm:p-12 shadow-2xl relative text-white">
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setIsProcessing(false);
              }}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors z-10 border border-white/10"
            >
              <FaTimes size={18} />
            </button>

            <div className="mb-10 text-center">
              <span className="text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.3em] block mb-2">Secure Booking</span>
              <h2 className="ed-font-serif text-3xl sm:text-4xl font-black text-white">Experience Admission</h2>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-8">
              {/* Personal Info */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">First Name</label>
                    <input
                      type="text" name="first_name" required
                      value={paymentForm.first_name} onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all ed-font-sans font-bold"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Last Name</label>
                    <input
                      type="text" name="last_name" required
                      value={paymentForm.last_name} onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all ed-font-sans font-bold"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Email Address</label>
                  <input
                    type="email" name="email" required
                    value={paymentForm.email} onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all ed-font-sans font-bold"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Phone Number</label>
                    <input
                      type="tel" name="phone_number" required
                      value={paymentForm.phone_number} onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all ed-font-sans font-bold"
                      placeholder="09..."
                    />
                  </div>
                  {ticketTypes.length > 1 && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Ticket Type</label>
                      <select
                        value={selectedTicketTypeIndex}
                        onChange={(e) => setSelectedTicketTypeIndex(parseInt(e.target.value, 10))}
                        className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all ed-font-sans font-bold appearance-none"
                      >
                        {ticketTypes.map((type, index) => (
                          <option key={index} value={index}>
                            {type.name} - {type.price} {event.currency}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Tickets</label>
                    <div className="flex items-center bg-black rounded-2xl border border-white/10 p-1 h-16 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => paymentForm.quantity > 1 && setPaymentForm({...paymentForm, quantity: paymentForm.quantity - 1})}
                        className="w-12 h-full flex-shrink-0 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      >
                        <FaChevronLeft size={16} />
                      </button>
                      <input
                        type="text" name="quantity" readOnly
                        value={paymentForm.quantity}
                        className="w-10 min-w-0 flex-1 bg-transparent border-none text-center focus:ring-0 ed-font-sans font-black text-xl text-white px-0"
                      />
                      <button
                        type="button"
                        onClick={() => setPaymentForm({...paymentForm, quantity: paymentForm.quantity + 1})}
                        className="w-12 h-full flex-shrink-0 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      >
                        <FaChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discount Section */}
              {commissionSellers.length > 0 && (
                <div className="p-6 bg-[#D4AF37]/10 rounded-2xl border border-[#D4AF37]/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest">Partner Discount</label>
                    {paymentForm.commission_seller_id && (
                      <span className="px-3 py-1 bg-[#D4AF37] text-white text-[10px] font-black rounded-full animate-bounce">
                        OFFER UNLOCKED
                      </span>
                    )}
                  </div>
                  <select
                    name="commission_seller_id"
                    value={paymentForm.commission_seller_id}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-xl bg-black border border-white/10 text-white font-bold focus:ring-2 focus:ring-[#D4AF37]/50 focus:outline-none appearance-none"
                  >
                    <option value="">Select a referral partner...</option>
                    {commissionSellers.map(seller => (
                      <option key={seller.id} value={seller.id}>
                        {seller.name} — {seller.discount_type === 'percentage' ? `${seller.discount_rate}%` : `${seller.discount_rate} ${event.currency}`} off
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Order Summary */}
              <div className="pt-8 border-t border-white/10 flex flex-col gap-3">
                <div className="flex justify-between text-white/40 font-bold text-xs uppercase tracking-widest">
                  <span>Subtotal ({paymentForm.quantity} tickets)</span>
                  <span>{(basePrice * paymentForm.quantity).toFixed(2)} {event.currency}</span>
                </div>
                {discountCalculation.discountAmount > 0 && (
                  <div className="flex justify-between text-[#D4AF37] font-extrabold text-xs uppercase tracking-widest">
                    <span>Discount — {discountCalculation.discountText}</span>
                    <span>-{discountCalculation.discountAmount.toFixed(2)} {event.currency}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-black text-white ed-font-serif">Total Admission</span>
                  <span className="text-3xl font-black text-[#D4AF37] ed-font-serif">
                    {Math.max(0, (basePrice * paymentForm.quantity) - discountCalculation.discountAmount).toFixed(2)} {event.currency}
                  </span>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-8 py-5 rounded-full border border-white/15 text-white/60 font-black uppercase text-[11px] tracking-widest hover:border-white hover:text-white transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-[2] ed-btn-primary py-5 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <FaSpinner className="animate-spin" /> : <>Pay Now <FaChevronRight size={10} /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Free Event Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 text-left">
          <div className="bg-[#0A0A0A] border border-white/15 rounded-[32px] max-w-md w-full overflow-hidden shadow-2xl relative text-white">
            {registrationSuccess ? (
              <div className="text-center p-12">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#D4AF37]">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="ed-font-serif text-3xl font-black text-white mb-4 tracking-tight">Confirmed!</h2>
                <p className="ed-font-sans text-white/60 font-medium leading-relaxed">
                  You have been successfully registered. Check your email for admission details.
                </p>
                <button 
                  onClick={() => setShowRegistrationModal(false)}
                  className="mt-10 px-10 py-4 bg-[#D4AF37] hover:bg-[#F5BD42] text-white rounded-full font-black uppercase text-[11px] tracking-widest transition-all font-sans"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="p-8 sm:p-10">
                <div className="mb-8">
                  <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] block mb-1">Free Admission</span>
                  <h2 className="ed-font-serif text-3xl font-black text-white">Join the Curation</h2>
                </div>
                
                <form onSubmit={handleFreeEventRegistration} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 font-sans">
                    <input
                      type="text" name="first_name" required placeholder="First Name"
                      value={paymentForm.first_name} onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-2xl bg-black border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all font-bold text-sm"
                    />
                    <input
                      type="text" name="last_name" required placeholder="Last Name"
                      value={paymentForm.last_name} onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-2xl bg-black border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all font-bold text-sm"
                    />
                  </div>
                  <input
                    type="email" name="email" required placeholder="Email Address"
                    value={paymentForm.email} onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-2xl bg-black border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all font-bold text-sm font-sans"
                  />
                  <input
                    type="tel" name="phone_number" required placeholder="Phone (09...)"
                    value={paymentForm.phone_number} onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-2xl bg-black border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all font-bold text-sm font-sans"
                  />
                  {/* Free events: 1 ticket per person only */}
                  <div className="flex items-center gap-3 pt-1 px-1 font-sans">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Tickets</span>
                    <span className="px-4 py-2 bg-white/10 rounded-xl text-sm font-black text-white">1 per person</span>
                    <span className="text-[10px] text-white/40 font-medium">Free events allow 1 registration per person only.</span>
                  </div>

                  <div className="pt-4 flex gap-3 font-sans">
                    <button
                      type="button"
                      onClick={() => setShowRegistrationModal(false)}
                      className="flex-1 py-4 text-white/40 hover:text-white font-bold uppercase text-[10px] tracking-widest"
                    > Discard </button>
                    <button
                      type="submit" disabled={isProcessing}
                      className="flex-[2] ed-btn-primary py-4 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <FaSpinner className="animate-spin" /> : "Confirm Admission"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rate Limit Countdown Modal */}
      {rateLimitCountdown !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 sm:p-8 shadow-xl">
            <div className="text-center">
              {rateLimitCountdown > 0 ? (
                <>
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    ⏱️ Rate Limit Exceeded
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6">
                    The payment system is temporarily limiting requests. This is a temporary restriction to ensure system stability.
                  </p>
                  
                  {/* Countdown Timer */}
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white mb-4 animate-pulse">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-bold">
                          {rateLimitCountdown}
                        </div>
                        <div className="text-xs sm:text-sm opacity-90">
                          {rateLimitCountdown === 1 ? 'second' : 'seconds'}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Please wait before trying again
                    </p>
                  </div>

                  <button
                    onClick={() => setRateLimitCountdown(null)}
                    className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close (Timer will continue in background)
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    ✅ Ready to Try Again
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6">
                    The rate limit has been lifted. You can now proceed with your payment.
                  </p>

                  <button
                    onClick={() => {
                      setRateLimitCountdown(null);
                      setIsProcessing(false);
                    }}
                    className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Close & Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Gallery Modal */}
      {fullscreenImageIndex !== null && event?.gallery && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-[60] flex items-center justify-center p-4"
          onClick={() => setFullscreenImageIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setFullscreenImageIndex(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 text-white hover:text-gray-300 transition-colors p-2 sm:p-3 bg-black/50 rounded-full hover:bg-black/70"
            aria-label="Close gallery"
          >
            <FaTimes size={24} className="sm:w-6 sm:h-6" />
          </button>

          {/* Previous Button */}
          {event.gallery.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImageIndex((prev) => {
                  if (prev === null) return null;
                  return prev > 0 ? prev - 1 : event.gallery!.length - 1;
                });
              }}
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 sm:p-4 bg-black/50 rounded-full hover:bg-black/70"
              aria-label="Previous image"
            >
              <FaChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Next Button */}
          {event.gallery.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImageIndex((prev) => {
                  if (prev === null) return null;
                  return prev < event.gallery!.length - 1 ? prev + 1 : 0;
                });
              }}
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 sm:p-4 bg-black/50 rounded-full hover:bg-black/70"
              aria-label="Next image"
            >
              <FaChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Image Container */}
          <div 
            className="relative max-w-full max-h-full w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={event.gallery[fullscreenImageIndex]}
              alt={`${event.title} - Gallery ${fullscreenImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: '90vh' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="text-white text-center"><p class="text-lg">Image unavailable</p></div>';
                }
              }}
            />
          </div>

          {/* Image Counter */}
          {event.gallery.length > 1 && (
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 text-white bg-black/50 px-4 py-2 rounded-full text-sm sm:text-base">
              {fullscreenImageIndex + 1} / {event.gallery.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventDetail;

