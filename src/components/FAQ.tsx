import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Mail, Phone, MessageCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  featured?: boolean;
}

const faqs: FAQItem[] = [
  {
    question: 'How do I make a hotel reservation?',
    answer: 'Making a reservation is easy! Simply search for your desired location and dates on our homepage, browse through the available hotels, select your preferred room, and complete the booking form with your details. You will receive a confirmation email immediately after booking.',
    featured: true
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'Our cancellation policy varies by property. Most hotels offer free cancellation up to 24-48 hours before check-in. You can find the specific cancellation policy for each hotel on their details page before completing your booking.',
    featured: true
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards including Visa, Mastercard, American Express, and Discover. We also support various digital payment methods. All transactions are secured with industry-standard encryption.',
    featured: true
  },
  {
    question: 'Can I modify my booking after confirmation?',
    answer: 'Yes, you can modify your booking by contacting our customer support team at hotelgreengarden0112@gmail.com or calling us. Please note that changes are subject to availability and may incur additional charges depending on the hotel policy.'
  },
  {
    question: 'Do your room rates include taxes and fees?',
    answer: 'The rates displayed are per night and may not include taxes and additional fees. The total cost including all applicable taxes and fees will be clearly shown during the booking process before you confirm your reservation.'
  },
  {
    question: 'What if I need to check in early or check out late?',
    answer: 'Early check-in and late check-out requests are subject to availability and may incur additional charges. We recommend contacting the hotel directly or adding your request in the special requirements field during booking, and the hotel will do their best to accommodate you.'
  },
  {
    question: 'Are the hotel amenities accessible to all guests?',
    answer: 'Yes, most amenities listed on each hotel page are available to all guests. Some facilities like spa services, golf courses, or premium dining experiences may require additional fees. Please check the specific amenities section on each hotel page for details.'
  },
  {
    question: 'How can I add special requests to my booking?',
    answer: 'During the booking process, you will find a "Special Requests" field where you can add any requirements such as high floor preference, extra pillows, dietary restrictions, or celebration arrangements. While we cannot guarantee all requests, we will do our best to accommodate them.'
  },
  {
    question: 'Is my personal information secure?',
    answer: 'Absolutely! We take data security very seriously. All personal information and payment details are encrypted using industry-standard SSL technology. We never share your information with third parties without your consent.'
  },
  {
    question: 'Can I book multiple rooms at once?',
    answer: 'Currently, you can book one room at a time through our website. For group bookings or multiple room reservations, please contact our customer service team who can assist you with special group rates and arrangements.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqs.filter(faq => faq.featured);
    }

    const query = searchQuery.toLowerCase();
    return faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-green-50 py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about booking and staying with us
          </p>
        </div>

        <div className="mb-10">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
            <input
              type="text"
              placeholder="Search your question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 text-lg rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all shadow-lg"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4 group-hover:text-emerald-700 transition-colors">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    {openIndex === index ? (
                      <ChevronUp className="text-emerald-600" size={20} />
                    ) : (
                      <ChevronDown className="text-emerald-600" size={20} />
                    )}
                  </div>
                </button>

                {openIndex === index && (
                  <div className="px-8 pb-6 animate-fade-in">
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-700 leading-relaxed text-base mt-4">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-md">
              <MessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 text-lg">No questions found matching your search.</p>
              <p className="text-gray-500 mt-2">Try a different keyword or contact us directly.</p>
            </div>
          )}
        </div>

        <div className="mt-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl shadow-2xl p-10 text-center">
          <h3 className="text-3xl font-bold text-white mb-3">
            Still Have Questions?
          </h3>
          <p className="text-emerald-50 text-lg mb-8 max-w-2xl mx-auto">
            Our friendly team is here to help you 24/7. Reach out and we'll get back to you as soon as possible!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:hotelgreengarden0112@gmail.com"
              className="group bg-white text-emerald-700 px-8 py-4 rounded-xl hover:bg-emerald-50 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3"
            >
              <Mail className="group-hover:scale-110 transition-transform" size={20} />
              Email Us
            </a>
            <a
              href="tel:+15551234567"
              className="group bg-emerald-800 text-white px-8 py-4 rounded-xl hover:bg-emerald-900 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3"
            >
              <Phone className="group-hover:scale-110 transition-transform" size={20} />
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
