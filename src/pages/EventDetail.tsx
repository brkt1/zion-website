import { useState } from "react";
import { FaCalendarAlt, FaInstagram, FaMapMarkerAlt, FaSpinner, FaTelegram, FaUsers, FaWhatsapp } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { ErrorState } from "../Components/ui/ErrorState";
import { LoadingState } from "../Components/ui/LoadingState";
import { getAvailablePaymentMethods } from "../data/paymentMethods";
import { useContactInfo, useEvent } from "../hooks/useApi";
import { initializePayment } from "../services/payment";
import { PaymentRequest } from "../types";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { event, isLoading, isError, mutate: refetchEvent } = useEvent(id);
  const { contactInfo } = useContactInfo();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'methods'>('form');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    quantity: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-24 pb-8 md:pt-28 md:pb-12">
          <LoadingState message="Loading event details..." />
        </div>
      </div>
    );
  }

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

      console.log('Payment calculation:', {
        originalPrice: event.price,
        pricePerTicket,
        quantity,
        totalAmount,
        currency: event.currency,
      });

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
      };

      console.log('Sending payment data to server:', {
        ...paymentData,
        amount: totalAmount,
        quantity: quantity,
      });

      const response = await initializePayment(paymentData);

      if (response.success && response.data?.checkout_url) {
        // Redirect to Chapa checkout
        window.location.href = response.data.checkout_url;
      } else {
        // Show error message
        const errorMsg = response.message || "Failed to initialize payment";
        if (response.error === 'LOCALHOST_URL_NOT_ALLOWED') {
          alert(
            "⚠️ Development Setup Required\n\n" +
            errorMsg + "\n\n" +
            (response.suggestion || "Please use a test key or ngrok for localhost development.")
          );
        } else {
          alert(errorMsg);
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
          "⚠️ Development Setup Required\n\n" +
          errorMsg + "\n\n" +
          (error.suggestion || "Please use a test key or ngrok for localhost development.")
        );
      } else {
        alert(errorMsg + (error.suggestion ? "\n\n" + error.suggestion : ""));
      }
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="pt-24 pb-8 md:pt-28 md:pb-12 relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="text-sm text-gray-500 uppercase tracking-wide">
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)} Event
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-4 text-gray-900">
            {event.title}
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            {event.image && (
              <div className="mb-12 rounded-lg overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-64 md:h-96 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Event Info */}
            <div className="grid md:grid-cols-3 gap-8 mb-12 pb-12 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FaCalendarAlt className="text-gray-400" size={18} />
                  <span className="text-sm text-gray-500 uppercase tracking-wide">Date & Time</span>
                </div>
                <div className="font-medium text-gray-900">{formatDate(event.date)}</div>
                {event.time && <div className="text-sm text-gray-600 mt-1">{event.time}</div>}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FaMapMarkerAlt className="text-gray-400" size={18} />
                  <span className="text-sm text-gray-500 uppercase tracking-wide">Location</span>
                </div>
                <div className="font-medium text-gray-900">{event.location}</div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FaUsers className="text-gray-400" size={18} />
                  <span className="text-sm text-gray-500 uppercase tracking-wide">Attendees</span>
                </div>
                <div className="font-medium text-gray-900">
                  {event.attendees || 0} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''}
                </div>
                {event.maxAttendees && (
                  <div className="text-sm text-gray-600 mt-1">
                    {event.maxAttendees - (event.attendees || 0)} spots remaining
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">About This Event</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                {event.description}
              </div>
            </div>

            {/* Gallery */}
            {event.gallery && event.gallery.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Event Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.gallery.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`${event.title} - Gallery ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Reserve Spot Card */}
              <div className="border border-gray-200 rounded-lg p-8 mb-6">
                <div className="mb-8">
                  <div className="text-4xl font-semibold text-gray-900 mb-1">
                    {event.price === "Free" ? "Free" : `${event.price} ${event.currency}`}
                  </div>
                  <div className="text-sm text-gray-600">per person</div>
                </div>
                
                <button 
                  onClick={() => event.price === "Free" ? alert("This is a free event! Registration coming soon.") : setShowPaymentModal(true)}
                  className="w-full bg-gray-900 text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
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

                <div className="border-t border-gray-200 pt-6">
                  <div className="text-sm font-medium text-gray-900 mb-4">Share this event</div>
                  <div className="flex gap-3">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-white p-3 rounded-lg transition-all text-center hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                      }}
                      aria-label="Share on WhatsApp"
                    >
                      <FaWhatsapp className="mx-auto text-xl" />
                    </a>
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors text-center"
                      aria-label="Share on Telegram"
                    >
                      <FaTelegram className="mx-auto text-xl" />
                    </a>
                    <a
                      href={`https://www.instagram.com/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors text-center"
                      aria-label="Share on Instagram"
                    >
                      <FaInstagram className="mx-auto text-xl" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-2">Questions?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Have questions about this event? Get in touch with us!
                </p>
                <a
                  href={`https://wa.me/${contactInfo?.phone?.replace(/\D/g, '') || '251978639887'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-white transition-all duration-300 hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                  }}
                >
                  <FaWhatsapp size={16} />
                  Contact via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {paymentStep === 'form' ? 'Complete Your Registration' : 'Choose Payment Method'}
            </h2>
            
            {paymentStep === 'form' ? (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  required
                  value={paymentForm.first_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  required
                  value={paymentForm.last_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={paymentForm.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  required
                  value={paymentForm.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="0911121314"
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Tickets *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  required
                  min="1"
                  max={event.maxAttendees ? event.maxAttendees - (event.attendees || 0) : 100}
                  value={paymentForm.quantity || 1}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="1"
                />
                {event.maxAttendees && (
                  <p className="mt-1 text-xs text-gray-500">
                    {event.maxAttendees - (event.attendees || 0)} tickets available
                  </p>
                )}
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price per ticket:</span>
                    <span className="text-gray-900 font-medium">
                      {event.price === "Free" || event.price?.toLowerCase() === "free" 
                        ? "Free" 
                        : `${parseFloat(event.price.toString().replace(/[^0-9.]/g, '') || '0').toFixed(2)} ${event.currency}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="text-gray-900 font-medium">
                      {paymentForm.quantity}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Total Amount:</span>
                  <span className="text-2xl font-semibold text-gray-900">
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

              <div className="flex gap-3 pt-4">
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
                    });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment Methods
                </button>
              </div>
            </form>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Select your preferred payment method. You'll complete the payment on Chapa's secure checkout page.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {getAvailablePaymentMethods(parseFloat(event.price)).map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedPaymentMethod === method.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{method.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                          {method.maxAmount && method.maxAmount > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Limit: {method.minAmount} - {method.maxAmount.toLocaleString()} ETB
                            </p>
                          )}
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <span className="text-gray-900">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price per ticket:</span>
                      <span className="text-gray-900 font-medium">
                        {event.price === "Free" || event.price?.toLowerCase() === "free" 
                          ? "Free" 
                          : `${parseFloat(event.price.toString().replace(/[^0-9.]/g, '') || '0').toFixed(2)} ${event.currency}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="text-gray-900 font-medium">
                        {paymentForm.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-700 font-medium">Total Amount:</span>
                    <span className="text-2xl font-semibold text-gray-900">
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

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setPaymentStep('form')}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePayment}
                    className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default EventDetail;

