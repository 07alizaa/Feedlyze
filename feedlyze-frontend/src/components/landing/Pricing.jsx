import React from 'react';
import { Check, Zap } from 'lucide-react';
import Button from '../common/Button';

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-50 rounded-full blur-3xl opacity-50 z-0 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl">
            Free During Beta
          </h2>
          <p className="mt-4 text-xl text-dark-500 max-w-2xl mx-auto">
            We're currently in public beta. Enjoy full access to all features while we fine-tune the platform.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 border-2 border-primary-500 shadow-xl flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
              LIMITED TIME OFFER
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl font-bold text-dark-900 mb-2">Early Adopter Plan</h3>
              <div className="flex items-baseline justify-center md:justify-start mb-4">
                <span className="text-5xl font-extrabold text-primary-600">$0</span>
                <span className="text-dark-400 font-medium ml-2 text-lg">forever*</span>
              </div>
              <p className="text-dark-500 mb-6">
                Join now and get locked into our early adopter benefits. No credit card required.
              </p>
              <Button variant="primary" size="lg" className="w-full md:w-auto px-8 shadow-lg shadow-primary-500/25">
                Get Started Free
              </Button>
            </div>

            <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-light-200 pt-8 md:pt-0 md:pl-12">
              <div className="grid grid-cols-1 gap-4">
                {[
                  'Unlimited Surveys',
                  'Unlimited Responses',
                  'AI Sentiment Analysis',
                  'Custom Branding',
                  'QR Code Generation',
                  'Priority Support'
                ].map((feature) => (
                  <div key={feature} className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-success-600" />
                    </div>
                    <span className="text-dark-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center bg-primary-50 rounded-xl p-4 border border-primary-100 flex items-start sm:items-center justify-center gap-3">
            <Zap className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm text-primary-800">
              <strong>Note:</strong> Accounts created during beta will retain free access to core features forever.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
