import React from 'react';
import { Check, Zap, QrCode, BarChart3, Shield, Smartphone } from 'lucide-react';
import Button from '../common/Button';

const FeaturesCapabilities = () => {
  const coreCapabilities = [
    {
      icon: QrCode,
      title: "Digital Feedback Collection",
      description: "Replace paper forms with QR codes that customers scan to submit feedback digitally"
    },
    {
      icon: BarChart3,
      title: "AI-Assisted Analysis",
      description: "Basic sentiment analysis and theme extraction to help understand feedback patterns"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Surveys optimized for mobile devices with no app installation required"
    },
    {
      icon: Shield,
      title: "Data Protection",
      description: "Secure storage of feedback data with standard privacy protections"
    }
  ];

  const useCases = [
    "Restaurants collecting table feedback",
    "Retail stores gathering customer opinions",
    "Healthcare facilities receiving patient feedback",
    "Educational institutions collecting student input",
    "Service businesses tracking customer satisfaction"
  ];

  return (
    <section id="capabilities" className="py-24 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-50 rounded-full blur-3xl opacity-50 z-0 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl">
            Capabilities & Use Cases
          </h2>
          <p className="mt-4 text-xl text-dark-500 max-w-2xl mx-auto">
            Feedlyze enables digital feedback collection for various scenarios where paper forms are still common.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Core Capabilities Card */}
          <div className="bg-white rounded-3xl p-8 md:p-12 border-2 border-primary-200 shadow-lg flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary-100 text-primary-800 text-xs font-bold px-4 py-1.5 rounded-bl-xl">
              ACADEMIC PROJECT
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl font-bold text-dark-900 mb-2">Core Capabilities</h3>
              <p className="text-dark-500 mb-6">
                Feedlyze provides practical tools for digitizing feedback collection and analysis:
              </p>
              
              <div className="space-y-4 mb-6">
                {coreCapabilities.map((capability, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center mr-3 flex-shrink-0">
                      <capability.icon className="w-4.5 h-4.5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-900 mb-1">{capability.title}</h4>
                      <p className="text-dark-500 text-sm">{capability.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="primary" size="lg" className="w-full md:w-auto px-8">
                Try Feedlyze
              </Button>
            </div>

            <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-light-200 pt-8 md:pt-0 md:pl-12">
              <h4 className="text-xl font-bold text-dark-900 mb-4">Practical Use Cases</h4>
              <p className="text-dark-500 mb-4">
                Suitable for any organization currently using paper-based feedback:
              </p>
              <div className="space-y-3">
                {useCases.map((useCase, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-success-600" />
                    </div>
                    <span className="text-dark-700">{useCase}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Academic Context Note */}
          <div className="mt-8 text-center bg-primary-50 rounded-xl p-4 border border-primary-100 flex flex-col sm:flex-row items-start sm:items-center justify-center gap-3">
            <Zap className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="text-left sm:text-center">
              <p className="text-sm text-primary-800">
                <strong>Academic Context:</strong> This project demonstrates practical application of web development, 
                QR technology, and AI analysis concepts for digital transformation of traditional processes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesCapabilities;