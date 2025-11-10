import { useEffect, useState } from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaInstagram, FaMapMarkerAlt, FaSpinner, FaTelegram, FaTimes, FaUsers, FaWhatsapp } from "react-icons/fa";
import { useParams, useSearchParams } from "react-router-dom";
import "../Components/Gallery.css";
import { ErrorState } from "../Components/ui/ErrorState";
import { LocationButton } from "../Components/ui/LocationButton";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { getAvailablePaymentMethods } from "../data/paymentMethods";
import { useContactInfo, useEvent } from "../hooks/useApi";
import { api } from "../services/api";
import { initializePayment } from "../services/payment";
import { registerForFreeEvent } from "../services/ticket";
import { CommissionSeller, PaymentRequest } from "../types";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { event, isError, mutate: refetchEvent } = useEvent(id);
  const { contactInfo } = useContactInfo();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'methods'>('form');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [commissionSellers, setCommissionSellers] = useState<CommissionSeller[]>([]);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [paymentForm, setPaymentForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    quantity: 1,
    commission_seller_id: searchParams.get('seller') || "",
  });

  // Load commission sellers - filter by event's allowed sellers if specified
  // This hook must be called before any early returns
  useEffect(() => {
    const loadSellers = async () => {
      if (!event) return;
      
      try {
        const allSellers = await api.getActiveCommissionSellers();
        
        // Debug logging
        console.log('Event allowed_commission_seller_ids:', event.allowed_commission_seller_ids);
        console.log('All active sellers:', allSellers.map(s => ({ id: s.id, name: s.name })));
        
        // If event has allowed_commission_seller_ids, filter to only those
        // If undefined/null, show all active sellers
        // If empty array [], show no sellers (admin explicitly selected none)
        if (event.allowed_commission_seller_ids !== undefined && event.allowed_commission_seller_ids !== null) {
          if (event.allowed_commission_seller_ids.length > 0) {
            // Filter to only allowed sellers
            const allowedSellers = allSellers.filter(seller => 
              event.allowed_commission_seller_ids!.includes(seller.id)
            );
            console.log('Filtered sellers:', allowedSellers.map(s => ({ id: s.id, name: s.name })));
            setCommissionSellers(allowedSellers);
          } else {
            // Empty array means no sellers allowed for this event
            console.log('Empty array - no sellers allowed');
            setCommissionSellers([]);
          }
        } else {
          // No restrictions set - show all active sellers
          console.log('No restrictions - showing all sellers');
          setCommissionSellers(allSellers);
        }
      } catch (error) {
        console.error('Error loading commission sellers:', error);
        // Don't show error to user, just continue without sellers
        setCommissionSellers([]);
      }
    };
    
    loadSellers();
  }, [event]);

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


  if (isError || !event) {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-24 pb-8 md:pt-28 md:pb-12">
          <ErrorState message="Failed to load event. Please try again later." onRetry={() => refetchEvent()} />
        </div>
      </div>
    );
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep('methods');
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Calculate total amount based on quantity
      // Handle "Free" price or parse numeric price
      let pricePerTicket = 0;
      if (event.price && event.price !== "Free" && event.price.toString().toLowerCase() !== "free") {
        // Extract numeric value from price string (handles "25", "25.00", "25 ETB", etc.)
        const priceStr = event.price.toString().trim();
        const numericPrice = priceStr.replace(/[^0-9.]/g, '');
        pricePerTicket = parseFloat(numericPrice) || 0;
      }
      
      const quantity = paymentForm.quantity || 1;
      const totalAmount = (pricePerTicket * quantity).toFixed(2);

      // Validate calculation
      if (pricePerTicket <= 0 && event.price !== "Free") {
        alert('Invalid event price. Please contact support.');
        setIsProcessing(false);
        return;
      }

      if (quantity <= 0) {
        alert('Please select at least 1 ticket.');
        setIsProcessing(false);
        return;
      }

      // Payment calculation logged for debugging

      const paymentData: PaymentRequest = {
        first_name: paymentForm.first_name,
        last_name: paymentForm.last_name,
        email: paymentForm.email,
        phone_number: paymentForm.phone_number,
        currency: event.currency,
        amount: totalAmount, // This should be the total (price * quantity)
        quantity: quantity,
        event_id: event.id,
        event_title: event.title,
        preferred_payment_method: selectedPaymentMethod || undefined,
        commission_seller_id: paymentForm.commission_seller_id || undefined,
      };

      // Payment data prepared for server

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
    } catch (error: any) {
      console.error("Payment error:", error);
      const errorMsg = error.message || "An error occurred. Please try again.";
      const errorType = error.error;
      
      // Check if it's a rate limit error
      if (errorType === 'RATE_LIMIT_EXCEEDED' || errorMsg.includes("Rate limit") || errorMsg.includes("try again in")) {
        alert(
          "⏱️ Rate Limit Exceeded\n\n" +
          errorMsg + "\n\n" +
          (error.suggestion || "Please wait a moment and try again.")
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

      await registerForFreeEvent(
        id,
        event.title,
        customerName,
        paymentForm.email,
        paymentForm.phone_number,
        paymentForm.quantity || 1
      );

      // Refresh event data to update attendee count
      refetchEvent();
      
      setRegistrationSuccess(true);
      setIsProcessing(false);
      
      // Redirect to Telegram group if link is available
      if (event.telegram_link && event.telegram_link.trim() !== '') {
        // Wait 2 seconds to show success message, then redirect
        setTimeout(() => {
          window.open(event.telegram_link, '_blank', 'noopener,noreferrer');
          // Close modal and reset form
          setShowRegistrationModal(false);
          setRegistrationSuccess(false);
          setPaymentForm({
            first_name: "",
            last_name: "",
            email: "",
            phone_number: "",
            quantity: 1,
            commission_seller_id: "",
          });
        }, 2000);
      } else {
        // If no Telegram link, just close modal after 3 seconds
        setTimeout(() => {
          setShowRegistrationModal(false);
          setRegistrationSuccess(false);
          setPaymentForm({
            first_name: "",
            last_name: "",
            email: "",
            phone_number: "",
            quantity: 1,
            commission_seller_id: "",
          });
        }, 3000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Failed to register. Please try again.');
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
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <section className="pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-4 sm:pb-6 md:pb-8 lg:pb-12 relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-3 sm:mb-4 md:mb-6">
            <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)} Event
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-semibold mb-3 sm:mb-4 text-gray-900 leading-tight">
            {event.title}
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Event Image */}
            {event.image && (
              <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-12 rounded-lg overflow-hidden bg-gray-100">
                <OptimizedImage
                  src={event.image}
                  alt={event.title}
                  width={1200}
                  height={600}
                  quality={60}
                  priority="high"
                  responsive={true}
                  className="w-full h-40 sm:h-48 md:h-64 lg:h-80 xl:h-96 object-cover"
                  style={{ maxWidth: '100%' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.style.display = 'none';
                    }
                  }}
                />
              </div>
            )}
            
            {/* Event Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-10 lg:mb-12 pb-6 sm:pb-8 md:pb-10 lg:pb-12 border-b border-gray-200">
              <div className="mb-4 sm:mb-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <FaCalendarAlt className="text-gray-400 flex-shrink-0" size={16} />
                  <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Date & Time</span>
                </div>
                <div className="font-medium text-sm sm:text-base text-gray-900">{formatDate(event.date)}</div>
                {event.time && <div className="text-xs sm:text-sm text-gray-600 mt-1">{event.time}</div>}
              </div>
              <div className="mb-4 sm:mb-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" size={16} />
                  <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Location</span>
                </div>
                <div className="font-medium text-sm sm:text-base">
                  <LocationButton location={event.location} className="text-gray-900" />
                </div>
              </div>
              <div className="mb-4 sm:mb-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <FaUsers className="text-gray-400 flex-shrink-0" size={16} />
                  <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Attendees</span>
                </div>
                <div className="font-medium text-sm sm:text-base text-gray-900">
                  {event.attendees || 0} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''}
                </div>
                {event.maxAttendees && (
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">
                    {event.maxAttendees - (event.attendees || 0)} spots remaining
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 md:mb-6">About This Event</h2>
              <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 whitespace-pre-line leading-relaxed text-sm sm:text-base">
                {event.description}
              </div>
            </div>

            {/* Gallery */}
            {event.gallery && event.gallery.length > 0 && (
              <div className="overflow-x-hidden">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 md:mb-6">Event Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                  {event.gallery.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-[30px] md:rounded-[40px] overflow-hidden cursor-pointer group"
                      style={{
                        background: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
                      }}
                      onClick={() => setFullscreenImageIndex(index)}
                      onMouseEnter={(e) => {
                        if (window.innerWidth >= 768) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      {/* Shadow overlay */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-[120px]"
                        style={{
                          boxShadow: 'inset 0 -120px 120px -120px black, inset 0 -120px 120px -100px black',
                        }}
                      ></div>
                      
                      {/* Label */}
                      <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-3 sm:left-4 md:left-5 flex items-center">
                        <div 
                          className="flex items-center justify-center min-w-[32px] sm:min-w-[36px] md:min-w-[40px] h-8 sm:h-9 md:h-10 rounded-full bg-white text-gray-700 font-semibold text-xs sm:text-sm"
                          style={{
                            color: '#E6E9ED',
                          }}
                        >
                          <span style={{ color: '#1a1a1a' }}>{index + 1}</span>
                        </div>
                        <div className="ml-2 sm:ml-3 flex flex-col text-white">
                          <div className="font-bold text-xs sm:text-sm md:text-base leading-tight">
                            Image {index + 1}
                          </div>
                          <div className="text-[10px] sm:text-xs opacity-90 leading-tight">
                            {event.title}
                          </div>
                        </div>
                      </div>
                      
                      {/* Hidden img for error handling */}
                      <img
                        src={image}
                        alt={`${event.title} - Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                        style={{ display: 'none' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            parent.style.background = 'linear-gradient(135deg, #E6E9ED 0%, #D1D5DB 100%)';
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-4 sm:top-6 lg:top-20 xl:top-24">
              {/* Reserve Spot Card */}
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 lg:p-8 mb-3 sm:mb-4 md:mb-6">
                <div className="mb-4 sm:mb-6 md:mb-8">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-1">
                    {event.price === "Free" ? "Free" : `${event.price} ${event.currency}`}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">per person</div>
                </div>
                
                {(() => {
                  const isFree = event.price === "Free" || event.price?.toLowerCase() === "free" || event.price === "0" || parseFloat(event.price.toString().replace(/[^0-9.]/g, '') || '0') === 0;
                  const isCommunity = event.category === 'community';
                  const hasSocialLink = event.social_media_link && event.social_media_link.trim() !== '';
                  
                  // Show registration button for free events (with or without social link)
                  if (isFree || isCommunity) {
                    return (
                      <>
                        <button 
                          onClick={() => setShowRegistrationModal(true)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 sm:py-3 md:py-4 rounded-lg text-xs sm:text-sm md:text-base font-medium hover:from-green-700 hover:to-emerald-700 transition-colors mb-3 sm:mb-4 md:mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <span className="flex items-center justify-center">
                              <FaSpinner className="animate-spin mr-2" />
                              Registering...
                            </span>
                          ) : (
                            "Register for Free"
                          )}
                        </button>
                        {hasSocialLink && (
                          <a
                            href={event.social_media_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 sm:py-3 md:py-4 rounded-lg text-xs sm:text-sm md:text-base font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors mb-3 sm:mb-4 md:mb-6 flex items-center justify-center gap-2"
                          >
                            <FaExternalLinkAlt className="text-lg" />
                            Join on Social Media
                          </a>
                        )}
                      </>
                    );
                  }
                  
                  // Show payment button for paid events
                  return (
                    <button 
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full bg-gray-900 text-white py-2.5 sm:py-3 md:py-4 rounded-lg text-xs sm:text-sm md:text-base font-medium hover:bg-gray-800 transition-colors mb-3 sm:mb-4 md:mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center">
                          <FaSpinner className="animate-spin mr-2" />
                          Processing...
                        </span>
                      ) : (
                        "Reserve Your Spot"
                      )}
                    </button>
                  );
                })()}

                <div className="border-t border-gray-200 pt-3 sm:pt-4 md:pt-6">
                  <div className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Share this event</div>
                  <div className="flex gap-2 sm:gap-3">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-white p-2 sm:p-3 rounded-lg transition-all text-center hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                      }}
                      aria-label="Share on WhatsApp"
                    >
                      <FaWhatsapp className="mx-auto text-lg sm:text-xl" />
                    </a>
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-500 text-white p-2 sm:p-3 rounded-lg hover:bg-blue-600 transition-colors text-center"
                      aria-label="Share on Telegram"
                    >
                      <FaTelegram className="mx-auto text-lg sm:text-xl" />
                    </a>
                    <a
                      href={`https://www.instagram.com/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-pink-500 text-white p-2 sm:p-3 rounded-lg hover:bg-pink-600 transition-colors text-center"
                      aria-label="Share on Instagram"
                    >
                      <FaInstagram className="mx-auto text-lg sm:text-xl" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 md:p-6">
                <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-900 mb-1.5 sm:mb-2">Questions?</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 md:mb-4">
                  Have questions about this event? Get in touch with us!
                </p>
                <a
                  href={`https://wa.me/${contactInfo?.phone?.replace(/\D/g, '') || '251978639887'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg font-medium text-xs sm:text-sm text-white transition-all duration-300 hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                  }}
                >
                  <FaWhatsapp size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Contact via WhatsApp</span>
                  <span className="sm:hidden">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-3 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[98vh] sm:max-h-[95vh] md:max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 my-2 sm:my-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
              {paymentStep === 'form' ? 'Complete Your Registration' : 'Choose Payment Method'}
            </h2>
            
            {paymentStep === 'form' ? (
            <form onSubmit={handleFormSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="first_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  required
                  value={paymentForm.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  required
                  value={paymentForm.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={paymentForm.email}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  required
                  value={paymentForm.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="0911121314"
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Number of Tickets *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentQty = paymentForm.quantity || 1;
                      if (currentQty > 1) {
                        setPaymentForm({ ...paymentForm, quantity: currentQty - 1 });
                      }
                    }}
                    disabled={(paymentForm.quantity || 1) <= 1}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    aria-label="Decrease quantity"
                  >
                    <span className="text-lg sm:text-xl">−</span>
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    required
                    min="1"
                    max={event.maxAttendees ? event.maxAttendees - (event.attendees || 0) : 100}
                    value={paymentForm.quantity || 1}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2.5 sm:py-3 text-center text-base sm:text-lg font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const currentQty = paymentForm.quantity || 1;
                      const maxQty = event.maxAttendees ? event.maxAttendees - (event.attendees || 0) : 100;
                      if (currentQty < maxQty) {
                        setPaymentForm({ ...paymentForm, quantity: currentQty + 1 });
                      }
                    }}
                    disabled={
                      (paymentForm.quantity || 1) >= (event.maxAttendees ? event.maxAttendees - (event.attendees || 0) : 100)
                    }
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    aria-label="Increase quantity"
                  >
                    <span className="text-lg sm:text-xl">+</span>
                  </button>
                </div>
                {event.maxAttendees && (
                  <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center">
                    {event.maxAttendees - (event.attendees || 0)} tickets available
                  </p>
                )}
              </div>

              {commissionSellers.length > 0 && (
                <div>
                  <label htmlFor="commission_seller_id" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Sold By (Optional)
                  </label>
                  <select
                    id="commission_seller_id"
                    name="commission_seller_id"
                    value={paymentForm.commission_seller_id}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors"
                  >
                    <option value="">Select a seller (optional)</option>
                    {commissionSellers.map((seller) => (
                      <option key={seller.id} value={seller.id}>
                        {seller.name} {seller.email ? `(${seller.email})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    If you were referred by a seller, please select them here
                  </p>
                </div>
              )}

              <div className="pt-4 sm:pt-6 border-t border-gray-200">
                <div className="space-y-2 mb-3 sm:mb-4">
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">Price per ticket:</span>
                    <span className="text-gray-900 font-medium">
                      {event.price === "Free" || event.price?.toLowerCase() === "free" 
                        ? "Free" 
                        : `${parseFloat(event.price.toString().replace(/[^0-9.]/g, '') || '0').toFixed(2)} ${event.currency}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="text-gray-900 font-medium">
                      {paymentForm.quantity}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm sm:text-base text-gray-700 font-medium">Total Amount:</span>
                  <span className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {(() => {
                      const price = event.price === "Free" || event.price?.toLowerCase() === "free"
                        ? 0
                        : parseFloat(event.price.toString().replace(/[^0-9.]/g, '') || '0');
                      const qty = paymentForm.quantity || 1;
                      return `${(price * qty).toFixed(2)} ${event.currency}`;
                    })()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setIsProcessing(false);
                    setPaymentStep('form');
                    setSelectedPaymentMethod(null);
                    setPaymentForm({
                      first_name: "",
                      last_name: "",
                      email: "",
                      phone_number: "",
                      quantity: 1,
                      commission_seller_id: searchParams.get('seller') || "",
                    });
                  }}
                  className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment Methods
                </button>
              </div>
            </form>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {/* Logo and Header */}
                <div className="flex items-center gap-2 sm:gap-3 mb-4">
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Choose Payment Method</h2>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 max-h-[60vh] overflow-y-auto pr-1">
                  {getAvailablePaymentMethods(parseFloat(event.price)).map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`aspect-square p-2 sm:p-2.5 border-2 rounded-2xl text-center transition-all hover:shadow-lg flex flex-col items-center justify-center ${
                        selectedPaymentMethod === method.id
                          ? 'border-gray-900 bg-gray-50 shadow-md scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        {method.icon.startsWith('http') || method.icon.startsWith('/') ? (
                          failedImages.has(method.id) ? (
                            <>
                              <span className="text-2xl sm:text-3xl mb-1">💳</span>
                              <div className="mt-auto w-full px-1 pb-0.5">
                                <h3 className="text-[9px] sm:text-[10px] font-semibold text-gray-900 leading-tight text-center line-clamp-2">{method.name}</h3>
                              </div>
                            </>
                          ) : (
                            <img 
                              src={method.icon} 
                              alt={method.name}
                              className="w-full h-full object-contain p-0.5 sm:p-1"
                              onError={() => {
                                setFailedImages(prev => new Set(prev).add(method.id));
                              }}
                            />
                          )
                        ) : (
                          <>
                            <span className="text-2xl sm:text-3xl flex-shrink-0 mb-1">{method.icon}</span>
                            <div className="mt-auto w-full px-1 pb-0.5">
                              <h3 className="text-[9px] sm:text-[10px] font-semibold text-gray-900 leading-tight line-clamp-2">{method.name}</h3>
                            </div>
                          </>
                        )}
                        {selectedPaymentMethod === method.id && (
                          <span className="absolute -top-1 -right-1 text-white flex-shrink-0 text-xs sm:text-sm font-bold bg-gray-900 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-md">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 sm:pt-6 border-t border-gray-200">
                  <div className="space-y-2 mb-3 sm:mb-4">
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-600">Price per ticket:</span>
                      <span className="text-gray-900 font-medium">
                        {event.price === "Free" || event.price?.toLowerCase() === "free" 
                          ? "Free" 
                          : `${parseFloat(event.price.toString().replace(/[^0-9.]/g, '') || '0').toFixed(2)} ${event.currency}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="text-gray-900 font-medium">
                        {paymentForm.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm sm:text-base text-gray-700 font-medium">Total Amount:</span>
                    <span className="text-xl sm:text-2xl font-semibold text-gray-900">
                      {(() => {
                        const price = event.price === "Free" || event.price?.toLowerCase() === "free"
                          ? 0
                          : parseFloat(event.price.toString().replace(/[^0-9.]/g, '') || '0');
                        const qty = paymentForm.quantity || 1;
                        return `${(price * qty).toFixed(2)} ${event.currency}`;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setPaymentStep('form')}
                    className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePayment}
                    className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessing || !selectedPaymentMethod}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </span>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Free Event Registration Modal */}
      {showRegistrationModal && event && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            {registrationSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                <p className="text-gray-600 mb-4">You've successfully registered for this free event.</p>
                {event.telegram_link && event.telegram_link.trim() !== '' ? (
                  <p className="text-sm text-gray-500">Redirecting you to the Telegram group...</p>
                ) : (
                  <p className="text-sm text-gray-500">You'll receive a confirmation email shortly.</p>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Register for Free Event</h2>
                  <button
                    onClick={() => {
                      setShowRegistrationModal(false);
                      setPaymentForm({
                        first_name: "",
                        last_name: "",
                        email: "",
                        phone_number: "",
                        quantity: 1,
                        commission_seller_id: "",
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
                <form onSubmit={handleFreeEventRegistration} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reg_first_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="reg_first_name"
                        name="first_name"
                        required
                        value={paymentForm.first_name}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg_last_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="reg_last_name"
                        name="last_name"
                        required
                        value={paymentForm.last_name}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="reg_email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="reg_email"
                      name="email"
                      required
                      value={paymentForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg_phone_number" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="reg_phone_number"
                      name="phone_number"
                      required
                      value={paymentForm.phone_number}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors"
                      placeholder="0911121314"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg_quantity" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Number of Tickets *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const currentQty = paymentForm.quantity || 1;
                          if (currentQty > 1) {
                            setPaymentForm({ ...paymentForm, quantity: currentQty - 1 });
                          }
                        }}
                        disabled={(paymentForm.quantity || 1) <= 1}
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        aria-label="Decrease quantity"
                      >
                        <span className="text-lg sm:text-xl">−</span>
                      </button>
                      <input
                        type="number"
                        id="reg_quantity"
                        name="quantity"
                        required
                        min="1"
                        max={event.maxAttendees ? event.maxAttendees - (event.attendees || 0) : 100}
                        value={paymentForm.quantity || 1}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-2.5 sm:py-3 text-center text-base sm:text-lg font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentQty = paymentForm.quantity || 1;
                          const maxQty = event.maxAttendees ? event.maxAttendees - (event.attendees || 0) : 100;
                          if (currentQty < maxQty) {
                            setPaymentForm({ ...paymentForm, quantity: currentQty + 1 });
                          }
                        }}
                        disabled={
                          (paymentForm.quantity || 1) >= (event.maxAttendees ? event.maxAttendees - (event.attendees || 0) : 100)
                        }
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        aria-label="Increase quantity"
                      >
                        <span className="text-lg sm:text-xl">+</span>
                      </button>
                    </div>
                    {event.maxAttendees && (
                      <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center">
                        {event.maxAttendees - (event.attendees || 0)} tickets available
                      </p>
                    )}
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm sm:text-base mb-4">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="text-xl font-semibold text-green-600">FREE</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRegistrationModal(false);
                        setPaymentForm({
                          first_name: "",
                          last_name: "",
                          email: "",
                          phone_number: "",
                          quantity: 1,
                          commission_seller_id: "",
                        });
                      }}
                      className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center">
                          <FaSpinner className="animate-spin mr-2" />
                          Registering...
                        </span>
                      ) : (
                        "Complete Registration"
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
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

