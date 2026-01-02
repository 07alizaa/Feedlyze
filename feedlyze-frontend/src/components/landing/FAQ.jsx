import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const faqs = [
    {
      question: "How does the AI sentiment analysis work?",
      answer: "Our AI uses advanced language models to analyze text responses and detect positive, negative, or neutral sentiment. It also extracts key themes and topics that customers mention most frequently, saving you hours of manual reading."
    },
    {
      question: "Can I customize the surveys with my branding?",
      answer: "Yes! Pro and Enterprise plans allow you to add your logo, customize colors, and match your brand identity perfectly."
    },
    {
      question: "What happens if I exceed my response limit?",
      answer: "You'll receive a notification when approaching your limit. You can upgrade your plan anytime or just pay for the extra responses for that month. We won't cut you off."
    },
    {
      question: "Is my customer data secure?",
      answer: "Absolutely. We use enterprise-grade encryption, secure cloud storage, and comply with GDPR and data protection regulations to keep your data safe."
    },
    {
      question: "Can I export my feedback data?",
      answer: "Yes, you can export responses as CSV, Excel, or PDF reports at any time for further analysis or sharing with your team."
    }
  ];

  return (
    <section className="py-24 bg-light-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQItem = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-light-200 overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none bg-white hover:bg-light-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-bold text-dark-900">{faq.question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-dark-500" /> : <ChevronDown className="w-5 h-5 text-dark-500" />}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-6 pb-6 text-dark-600 leading-relaxed border-t border-light-100 pt-4">
          {faq.answer}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
