import { useState, useRef } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import emailjs from "@emailjs/browser";

// EmailJS Configuration
const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_mz16rsu";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formRef.current) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    emailjs
      .sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY
      )
      .then((result) => {
        console.log("SUCCESS:", result);
        setSubmitSuccess(true);
        formRef.current?.reset();
      })
      .catch((error) => {
        console.error("ERROR:", error);
        setSubmitError("Failed to send message. Please try again.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1
            className="text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Gilda Display', serif" }}
          >
            Get in Touch
          </h1>
          <p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 300 }}
          >
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: "'Gilda Display', serif" }}
            >
              Contact Information
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3
                    className="font-semibold text-gray-900 mb-1"
                    style={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Address
                  </h3>
                  <p
                    className="text-gray-600"
                    style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 300 }}
                  >
                    Hotel Green Garden
                    <br />
                    Opp. Govt. ITI College, Civil Lines
                    <br />
                    Ludhiana, Punjab 141001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3
                    className="font-semibold text-gray-900 mb-1"
                    style={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Phone
                  </h3>
                  <p
                    className="text-gray-600"
                    style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 300 }}
                  >
                    78143 91779
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3
                    className="font-semibold text-gray-900 mb-1"
                    style={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Email
                  </h3>
                  <p
                    className="text-gray-600"
                    style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 300 }}
                  >
                    hotelgreengarden0112@gmail.com
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3
                className="font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "'Roboto', sans-serif" }}
              >
                Find Us on Map
              </h3>

              <div className="w-full overflow-hidden rounded-xl shadow-md border border-gray-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3422.8647333708145!2d75.91413247558762!3d30.918404874495245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a9ddc5ee9e8d9%3A0xb89821ba8fc8798d!2sHotel%20Green%20Garden!5e0!3m2!1sen!2sin!4v1774855240121!5m2!1sen!2sin"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hotel Green Garden Location"
                  className="w-full"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: "'Gilda Display', serif" }}
            >
              Send us a Message
            </h2>

            {submitSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-emerald-800 font-medium">
                  Thank you! Your message has been sent successfully.
                </p>
              </div>
            )}

            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">{submitError}</p>
              </div>
            )}

            <form ref={formRef} onSubmit={sendEmail} className="space-y-6">
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
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
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
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="+91 XXXXX XXXXX"
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
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
