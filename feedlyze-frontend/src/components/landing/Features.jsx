import React from 'react';
import { Bot, Smartphone, BarChart2, MessageCircle, Palette, Lock } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Analysis',
      description: 'Automatic sentiment detection and theme extraction from text responses.'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Surveys',
      description: 'Beautiful, responsive forms optimized for mobile devices.'
    },
    {
      icon: BarChart2,
      title: 'Real-Time Analytics',
      description: 'Live dashboard with actionable insights updated in real-time.'
    },
    {
      icon: MessageCircle,
      title: 'Smart Chatbot',
      description: 'AI assistant helps build surveys from natural language descriptions.'
    },
    {
      icon: Palette,
      title: 'Custom Branding',
      description: 'Add your logo, colors, and customize everything to match your brand.'
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      description: 'Enterprise-grade security and compliance with data protection laws.'
    }
  ];

  return (
    <section id="features" className="py-24 bg-light-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl">
            Powerful Features, Simple to Use
          </h2>
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
      </div>
    </section>
  );
};

export default Features;
