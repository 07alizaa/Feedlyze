import React from 'react';
import { ArrowRight, QrCode, ClipboardList, PieChart } from 'lucide-react';
import Button from '../common/Button';

const HowItWorks = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl">
            How Feedlyze Works
          </h2>
          <p className="mt-4 text-xl text-dark-500">
            Get actionable feedback in 3 simple steps
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-12">
          {/* HIdden connector line for desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-light-200 -z-10 transform translate-y-1/2"></div>

          {/* Step 1 */}
          <div className="relative text-center">
            <div className="w-12 h-12 mx-auto bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 relative z-10 ring-8 ring-white">
              1
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-4">Create Survey</h3>
            <p className="text-dark-500 mb-8">Build custom feedback forms in minutes with our intuitive builder.</p>

            {/* Mockup */}
            <div className="bg-white border border-light-200 rounded-xl shadow-lg p-3 mx-auto max-w-xs transform hover:-translate-y-2 transition-transform duration-300">
              <div className="h-32 bg-light-50 rounded mb-2 border border-light-100 flex flex-col items-center justify-center">
                <ClipboardList className="text-primary-300 w-12 h-12 mb-2" />
                <div className="text-xs text-light-400">Drag & Drop Builder</div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-light-200 rounded w-3/4 mx-auto"></div>
                <div className="h-2 bg-light-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative text-center">
            <div className="w-12 h-12 mx-auto bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 relative z-10 ring-8 ring-white">
              2
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-4">Share QR Code</h3>
            <p className="text-dark-500 mb-8">Customers scan and respond in seconds from their phones.</p>

            {/* Mockup */}
            <div className="bg-white border border-light-200 rounded-xl shadow-lg p-3 mx-auto max-w-xs transform hover:-translate-y-2 transition-transform duration-300">
              <div className="aspect-square bg-dark-900 rounded flex items-center justify-center mb-2">
                <QrCode className="text-white w-20 h-20" />
              </div>
              <div className="text-xs text-center text-dark-500 font-medium">Scan to Feedback</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative text-center">
            <div className="w-12 h-12 mx-auto bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 relative z-10 ring-8 ring-white">
              3
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-4">Get AI Insights</h3>
            <p className="text-dark-500 mb-8">AI automatically analyzes sentiment and extracts emerging themes.</p>

            {/* Mockup */}
            <div className="bg-white border border-light-200 rounded-xl shadow-lg p-3 mx-auto max-w-xs transform hover:-translate-y-2 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-dark-700">Sentiment</span>
                <span className="text-xs text-success-600 font-bold">+0.8</span>
              </div>
              <div className="h-24 bg-light-50 rounded flex items-center justify-center mb-2">
                <PieChart className="text-success-400 w-16 h-16" />
              </div>
              <div className="flex gap-1 justify-center">
                <div className="w-2 h-2 rounded-full bg-success-400"></div>
                <div className="w-2 h-2 rounded-full bg-warning-400"></div>
                <div className="w-2 h-2 rounded-full bg-danger-400"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <Button size="xl" variant="primary" className="shadow-lg shadow-primary-500/30">
            Start Building Free <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
