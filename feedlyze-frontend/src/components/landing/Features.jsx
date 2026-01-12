import React from 'react';
import { QrCode, Brain, FileText, Download, Printer, Smartphone, Shield, TrendingUp, FolderOpen } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: QrCode,
      title: 'QR Code Generation',
      description: 'Create unique QR codes for each survey to place in physical locations.'
    },
    {
      icon: FileText,
      title: 'Digital Survey Creation',
      description: 'Build structured feedback forms with different question types for various use cases.'
    },
    {
      icon: Brain,
      title: 'Basic Sentiment Analysis',
      description: 'Automatically categorize feedback as positive, negative, or neutral based on text content.'
    },
    {
      icon: Download,
      title: 'Data Export',
      description: 'Export all collected responses in CSV format for external analysis and record-keeping.'
    },
    {
      icon: Printer,
      title: 'Paper-to-Digital Bridge',
      description: 'Print QR codes to replace physical feedback forms at counters, desks, or service points.'
    },
    {
      icon: Smartphone,
      title: 'Mobile Accessibility',
      description: 'Surveys are accessible on any smartphone camera without app installation.'
    },
    {
      icon: TrendingUp,
      title: 'Feedback Trends',
      description: 'View organized feedback data to identify patterns and common themes over time.'
    },
    {
      icon: FolderOpen,
      title: 'Centralized Storage',
      description: 'All feedback collected digitally in one place instead of scattered paper forms.'
    },
    {
      icon: Shield,
      title: 'Standard Data Protection',
      description: 'Basic security measures appropriate for academic and small business feedback collection.'
    }
  ];

  return (
    <section id="features" className="py-24 bg-light-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl">
            Core Functionalities
          </h2>
          <p className="mt-4 text-xl text-dark-500 max-w-2xl mx-auto">
            Practical features designed for digitizing feedback collection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-card-hover transition-all duration-300 border border-light-200 group">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-colors">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-3">{feature.title}</h3>
              <p className="text-dark-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Context Note - Matching your previous styling */}
        <div className="mt-16 pt-8 border-t border-light-200 text-center">
          <p className="text-dark-500 max-w-2xl mx-auto">
            These functionalities demonstrate the transition from paper-based to digital feedback systems, 
            focusing on practical implementation rather than commercial features.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;