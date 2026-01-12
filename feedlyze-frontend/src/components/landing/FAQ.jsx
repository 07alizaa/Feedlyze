import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const faqs = [
    {
      question: "What is Feedlyze and what problem does it solve?",
      answer: "Feedlyze digitizes manual feedback collection by replacing paper forms with QR-based digital surveys. It helps businesses and institutions transition from physical feedback cards to centralized digital feedback systems, making analysis more efficient and reducing paper waste."
    },
    {
      question: "How does the QR code feedback collection work?",
      answer: "You create a digital survey in Feedlyze and generate a unique QR code. Print and display this code where you want feedback—on counters, tables, or service points. Respondents scan it with their phone camera, complete the survey digitally, and responses are immediately available in your dashboard."
    },
    {
      question: "What kind of AI analysis does Feedlyze provide?",
      answer: "The system provides basic AI-assisted sentiment analysis to categorize responses as positive, negative, or neutral based on text content. It also identifies frequently mentioned words and themes, helping you quickly understand common feedback patterns without reading every response individually."
    },
    {
      question: "Do respondents need to install an app or create an account?",
      answer: "No. Respondents simply scan the QR code with their phone's camera, which opens the survey in their mobile browser. No app installation, account creation, or login is required, making it accessible for all customers."
    },
    {
      question: "How is my feedback data stored and protected?",
      answer: "All collected feedback is stored securely in your private dashboard. We implement standard data protection practices including encryption and access controls appropriate for academic and business use. You maintain ownership of all your collected data."
    },
    {
      question: "Can I access my data outside the Feedlyze platform?",
      answer: "Yes, you can export your collected responses in CSV format for offline analysis, reporting, or archival purposes. This ensures you always have access to your data."
    },
    {
      question: "What types of organizations benefit from Feedlyze?",
      answer: "Any organization that collects regular customer or visitor feedback can benefit—restaurants, retail stores, healthcare facilities, educational institutions, and service businesses. It's particularly useful for those currently using paper feedback forms or manual collection methods."
    },
    {
      question: "How quickly can I start collecting feedback?",
      answer: "You can create your first survey and generate a QR code within minutes. Once printed and displayed, you can start receiving digital feedback immediately from anyone with a smartphone camera."
    }
  ];

  return (
    <section className="py-24 bg-light-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-xl text-dark-500">
            Common questions about digital feedback collection
          </p>
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