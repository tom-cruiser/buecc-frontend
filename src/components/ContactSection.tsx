import React, { useState, Suspense, useEffect, useRef } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  X,
} from "lucide-react";
import config from '../config/config';

// Lazy load the map component
const OfficeMap = React.lazy(() => import("./OfficeMap"));

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    serviceType: "general",
  });

  const [chatVisible, setChatVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [botpressLoaded, setBotpressLoaded] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const scriptsLoadedRef = useRef(false);

  // Initialize and handle Botpress webchat with better error handling
  useEffect(() => {
    const initializeBotpress = async () => {
      if (chatVisible && !botpressLoaded && !scriptsLoadedRef.current) {
        setChatLoading(true);

        try {
          // Check if Botpress is already loaded globally
          if (window.botpressWebChat) {
            console.log("Botpress already loaded");
            setBotpressLoaded(true);
            setChatLoading(false);
            return;
          }

          // Load inject script
          await new Promise((resolve, reject) => {
            const injectScript = document.createElement("script");
            injectScript.src =
              "https://cdn.botpress.cloud/webchat/v3.3/inject.js";
            injectScript.async = true;
            injectScript.onload = resolve;
            injectScript.onerror = reject;
            document.head.appendChild(injectScript);
          });

          // Load config script
          await new Promise((resolve, reject) => {
            const configScript = document.createElement("script");
            configScript.src =
              "https://files.bpcontent.cloud/2025/10/08/14/20251008142636-5L65XRPK.js";
            configScript.defer = true;
            configScript.onload = resolve;
            configScript.onerror = reject;
            document.head.appendChild(configScript);
          });

          // Wait for Botpress to initialize
          const maxWaitTime = 10000; // 10 seconds
          const startTime = Date.now();

          const checkBotpressLoaded = () => {
            if (window.botpressWebChat) {
              setBotpressLoaded(true);
              setChatLoading(false);
              scriptsLoadedRef.current = true;
              console.log("Botpress loaded successfully");
            } else if (Date.now() - startTime < maxWaitTime) {
              setTimeout(checkBotpressLoaded, 100);
            } else {
              setChatLoading(false);
              console.error("Botpress failed to load within timeout");
            }
          };

          checkBotpressLoaded();
        } catch (error) {
          console.error("Failed to load Botpress scripts:", error);
          setChatLoading(false);
          setSubmitError(
            "Chat service is temporarily unavailable. Please try again later or use the contact form."
          );
        }
      }
    };

    initializeBotpress();
  }, [chatVisible, botpressLoaded]);

  // Handle chat toggle with better state management
  const toggleChat = () => {
    const newChatVisible = !chatVisible;
    setChatVisible(newChatVisible);

    if (newChatVisible && botpressLoaded && window.botpressWebChat) {
      try {
        // Use show/hide methods if available
        if (typeof window.botpressWebChat.sendEvent === "function") {
          window.botpressWebChat.sendEvent({ type: "show" });
        } else if (typeof window.botpressWebChat.open === "function") {
          window.botpressWebChat.open();
        }
      } catch (e) {
        console.error("Failed to show Botpress chat:", e);
      }
    } else if (!newChatVisible && botpressLoaded && window.botpressWebChat) {
      try {
        if (typeof window.botpressWebChat.sendEvent === "function") {
          window.botpressWebChat.sendEvent({ type: "hide" });
        } else if (typeof window.botpressWebChat.close === "function") {
          window.botpressWebChat.close();
        }
      } catch (e) {
        console.error("Failed to hide Botpress chat:", e);
      }
    }
  };

  // Alternative manual initialization if automatic fails
  const initializeChatManually = () => {
    if (
      window.botpressWebChat &&
      typeof window.botpressWebChat.init === "function"
    ) {
      try {
        window.botpressWebChat.init();
        setBotpressLoaded(true);
        setChatLoading(false);
      } catch (e) {
        console.error("Manual initialization failed:", e);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    // Basic client-side validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setSubmitError(
        "Please fill in all required fields: Full Name, Email, Subject, and Message."
      );
      setIsSubmitting(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setSubmitError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${config.API_ENDPOINT}/contact/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          throw new Error(
            `Server responded with status ${response.status}: ${response.statusText}`
          );
        }
        throw new Error(errorData.message || "Failed to send message.");
      }

      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        serviceType: "general",
      });
    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmitError(
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to find your dream property or start your construction
            project? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Information
            </h3>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <Phone className="text-blue-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                  <p className="text-gray-600">+257 61 04 81 09</p>
                  <p className="text-gray-600">+257 79 98 09 85</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <Mail className="text-green-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                  <p className="text-gray-600">bueccompany@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-orange-100 p-3 rounded-lg mr-4">
                  <MapPin className="text-orange-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Office Address
                  </h4>
                  <p className="text-gray-600">Avenue Sanzu no 2,</p>
                  <p className="text-gray-600">
                    Boulevard Mwezi Gisabo, Bujumbura
                  </p>
                  <p className="text-gray-600">Burundi</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <Clock className="text-purple-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Business Hours
                  </h4>
                  <p className="text-gray-600">Mon-Fri: 8:00 AM - 6:00 PM</p>
                  <p className="text-gray-600">Sat: 9:00 AM - 4:00 PM</p>
                  <p className="text-gray-600">Sun: Closed</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-8 p-6 bg-red-50 rounded-xl border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">
                Emergency Contact
              </h4>
              <p className="text-red-700">For urgent matters:</p>
              <p className="text-red-800 font-medium">
                +257 79 98 09 85 (24/7)
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h3>

              {/* Success Message */}
              {submitSuccess && (
                <div
                  className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg"
                  role="alert"
                >
                  Thank you! Your message has been sent successfully.
                </div>
              )}

              {/* Error Message */}
              {submitError && (
                <div
                  className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg"
                  role="alert"
                >
                  Error: {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+257 XX XX XX XX"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="serviceType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Service Type
                    </label>
                    <select
                      id="serviceType"
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="property">Property Inquiry</option>
                      <option value="construction">
                        Construction Services
                      </option>
                      <option value="consultation">Free Consultation</option>
                      <option value="viewing">Property Viewing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-lg font-medium text-lg flex items-center justify-center transition-colors duration-200 ${
                    isSubmitting
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="mr-2" size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Visit Our Office
          </h3>
          <div className="rounded-2xl overflow-hidden h-96 bg-gray-100 shadow-lg">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center">
                  <p>Loading map...</p>
                </div>
              }
            >
              <OfficeMap />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        disabled={chatLoading}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-200 z-50 flex items-center justify-center ${
          chatLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        } ${chatVisible ? "scale-110" : ""}`}
        aria-label={chatLoading ? "Loading chat..." : "Toggle chat widget"}
      >
        {chatLoading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : chatVisible ? (
          <X size={24} />
        ) : (
          <MessageCircle size={24} />
        )}
      </button>

      {/* Chat Status Indicator */}
      {chatLoading && (
        <div className="fixed bottom-20 right-6 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm z-50">
          Loading chat...
        </div>
      )}

      {/* Manual Initialization Button (hidden but available for debugging) */}
      {process.env.NODE_ENV === "development" && !botpressLoaded && (
        <button
          onClick={initializeChatManually}
          className="fixed bottom-32 right-6 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm z-50 opacity-70 hover:opacity-100"
        >
          Manual Init
        </button>
      )}

      {/* Botpress Container */}
      <div
        id="botpress-webchat"
        className={`fixed bottom-0 right-0 z-40 ${
          !chatVisible ? "hidden" : ""
        }`}
      />
    </section>
  );
};

// Enhanced TypeScript declaration for Botpress
declare global {
  interface Window {
    botpressWebChat?: {
      init: () => void;
      sendEvent: (event: { type: string }) => void;
      open: () => void;
      close: () => void;
      [key: string]: any;
    };
  }
}

export default ContactSection;
