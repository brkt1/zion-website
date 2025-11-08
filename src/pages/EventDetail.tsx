import { useState } from "react";
import { FaCalendarAlt, FaInstagram, FaMapMarkerAlt, FaSpinner, FaTelegram, FaUsers, FaWhatsapp } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { getAvailablePaymentMethods } from "../data/paymentMethods";
import { initializePayment } from "../services/payment";
import { PaymentRequest } from "../types";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'methods'>('form');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  // Sample event data - replace with API call
  const event = {
    id: id || "1",
    title: "Friday Game Night",
    date: "2024-02-15",
    time: "6:00 PM",
    location: "Addis Ababa, Ethiopia",
    category: "game",
    description: `Join us for an unforgettable evening of fun, games, and laughter! Our Friday Game Night is the perfect way to unwind after a long week and meet amazing people in the community.

What to expect:
• Board games for all skill levels
• Trivia challenges with prizes
• Interactive group activities
• Delicious snacks and refreshments
• Great music and atmosphere

Whether you're a game enthusiast or just looking to have a good time, everyone is welcome!`,
    image: "/api/placeholder/800/400",
    attendees: 25,
    maxAttendees: 50,
    price: "500",
    currency: "ETB",
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep('methods');
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const paymentData: PaymentRequest = {
        first_name: paymentForm.first_name,
        last_name: paymentForm.last_name,
        email: paymentForm.email,
        phone_number: paymentForm.phone_number,
        currency: event.currency,
        amount: event.price,
        event_id: event.id,
        event_title: event.title,
        preferred_payment_method: selectedPaymentMethod || undefined,
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
    setPaymentForm({
      ...paymentForm,
      [e.target.name]: e.target.value,
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="h-64 md:h-96 bg-gradient-to-br from-amber-400 to-orange-500 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="container mx-auto px-4 relative h-full flex items-end pb-8">
          <div>
            <div className="inline-block bg-white px-4 py-2 rounded-full text-sm font-semibold text-amber-600 mb-4">
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)} Event
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <FaCalendarAlt className="text-amber-600 text-2xl mb-3" />
                <div className="text-sm text-gray-600 mb-1">Date & Time</div>
                <div className="font-semibold text-gray-900">{formatDate(event.date)}</div>
                <div className="text-sm text-gray-600">{event.time}</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <FaMapMarkerAlt className="text-amber-600 text-2xl mb-3" />
                <div className="text-sm text-gray-600 mb-1">Location</div>
                <div className="font-semibold text-gray-900">{event.location}</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <FaUsers className="text-amber-600 text-2xl mb-3" />
                <div className="text-sm text-gray-600 mb-1">Attendees</div>
                <div className="font-semibold text-gray-900">
                  {event.attendees} / {event.maxAttendees}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                {event.description}
              </div>
            </div>

            {/* Gallery Placeholder */}
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Gallery</h2>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="aspect-square bg-gradient-to-br from-amber-200 to-orange-300 rounded-lg"
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Reserve Spot Card */}
              <div className="bg-white rounded-xl p-8 shadow-lg mb-6">
                <div className="text-3xl font-bold text-amber-600 mb-2">
                  {event.price === "Free" ? "Free" : `${event.price} ${event.currency}`}
                </div>
                <div className="text-gray-600 mb-6">per person</div>
                
                <button 
                  onClick={() => event.price === "Free" ? alert("This is a free event! Registration coming soon.") : setShowPaymentModal(true)}
                  className="w-full bg-amber-600 text-white py-4 rounded-lg font-semibold hover:bg-amber-700 transition-all mb-4 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
                
                <div className="text-center text-sm text-gray-600 mb-6">
                  {event.maxAttendees - event.attendees} spots remaining
                </div>

                <div className="border-t pt-6">
                  <div className="text-sm font-semibold text-gray-900 mb-4">Share this event</div>
                  <div className="flex gap-3">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-all text-center"
                      aria-label="Share on WhatsApp"
                    >
                      <FaWhatsapp className="mx-auto text-xl" />
                    </a>
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-all text-center"
                      aria-label="Share on Telegram"
                    >
                      <FaTelegram className="mx-auto text-xl" />
                    </a>
                    <a
                      href={`https://www.instagram.com/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-all text-center"
                      aria-label="Share on Instagram"
                    >
                      <FaInstagram className="mx-auto text-xl" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-100 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Questions?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Have questions about this event? Get in touch with us!
                </p>
                <Link
                  to="/contact"
                  className="text-amber-600 font-semibold hover:text-amber-700 text-sm"
                >
                  Contact Us →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="0911121314"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700">Total Amount:</span>
                  <span className="text-2xl font-bold text-amber-600">
                    {event.price} {event.currency}
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
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
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
                          <span className="text-amber-600">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">Total Amount:</span>
                    <span className="text-2xl font-bold text-amber-600">
                      {event.price} {event.currency}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setPaymentStep('form')}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePayment}
                    className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

