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
            Transform paper feedback into digital insights
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-12">
          {/* Hidden connector line for desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-light-200 -z-10 transform translate-y-1/2"></div>

          {/* Step 1 */}
          <div className="relative text-center">
            <div className="w-12 h-12 mx-auto bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 relative z-10 ring-8 ring-white">
              1
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-4">Create Digital Survey</h3>
            <p className="text-dark-500 mb-8">Design structured feedback forms to replace paper-based collection methods.</p>

            {/* Mockup */}
            <div className="bg-white border border-light-200 rounded-xl shadow-card p-3 mx-auto max-w-xs">
              <div className="h-32 bg-light-50 rounded mb-2 border border-light-100 flex flex-col items-center justify-center">
                <ClipboardList className="text-primary-400 w-12 h-12 mb-2" />
                <div className="text-xs text-dark-500">Question Types</div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-primary-200 rounded w-3/4 mx-auto"></div>
                <div className="h-2 bg-primary-100 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative text-center">
            <div className="w-12 h-12 mx-auto bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 relative z-10 ring-8 ring-white">
              2
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-4">Deploy QR Code</h3>
            <p className="text-dark-500 mb-8">Place QR codes where paper feedback was collected—counters, desks, or forms.</p>

            {/* Mockup */}
            <div className="bg-white border border-light-200 rounded-xl shadow-card p-3 mx-auto max-w-xs">
              <div className="aspect-square bg-white rounded flex items-center justify-center mb-2 border border-light-300">
                <div className="relative">
                  <QrCode className="text-dark-800 w-20 h-20" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-sm"></div>
                </div>
              </div>
              <div className="text-xs text-center text-dark-500 font-medium">Scan to provide feedback</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative text-center">
            <div className="w-12 h-12 mx-auto bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 relative z-10 ring-8 ring-white">
              3
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-4">Review AI-Assisted Analysis</h3>
            <p className="text-dark-500 mb-8">Basic AI helps identify sentiment and common themes in collected responses.</p>

            {/* Mockup */}
            <div className="bg-white border border-light-200 rounded-xl shadow-card p-3 mx-auto max-w-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-dark-700">Analysis</span>
                <span className="text-xs text-primary-600 font-bold">AI-assisted</span>
              </div>
              <div className="h-24 bg-light-50 rounded flex items-center justify-center mb-2">
                <PieChart className="text-primary-400 w-16 h-16" />
              </div>
              <div className="flex gap-1 justify-center">
                <div className="text-xs text-dark-500">Theme extraction</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <Button size="xl" variant="primary">
            Create Your First Survey
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;