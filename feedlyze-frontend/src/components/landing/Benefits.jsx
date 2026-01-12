import React from 'react';
import { Clock, Paperclip, TrendingUp, Shield, BarChart, Zap } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: Clock,
      title: 'Time Efficiency',
      description: 'No manual data entry from paper forms'
    },
    {
      icon: Paperclip,
      title: 'Centralized Storage',
      description: 'All feedback organized in one digital location'
    },
    {
      icon: TrendingUp,
      title: 'Better Analysis',
      description: 'Digital data enables pattern recognition'
    },
    {
      icon: Shield,
      title: 'Reduced Paper Waste',
      description: 'Environmentally friendly feedback collection'
    },
    {
      icon: BarChart,
      title: 'Actionable Insights',
      description: 'Structured data for informed decisions'
    },
    {
      icon: Zap,
      title: 'Instant Collection',
      description: 'Feedback available immediately after submission'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold opacity-90">
            Advantages of Digital Feedback
          </h2>
          <p className="mt-4 opacity-80 max-w-2xl mx-auto">
            Transitioning from paper to digital feedback offers practical benefits
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <benefit.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="text-lg font-semibold mb-1">{benefit.title}</div>
              <div className="text-sm opacity-80">{benefit.description}</div>
            </div>
          ))}
        </div>
        
        {/* Academic Context */}
        <div className="mt-12 pt-8 border-t border-white/20 text-center">
          <p className="text-sm opacity-80 max-w-2xl mx-auto">
            This project demonstrates how digital tools can modernize traditional feedback processes
          </p>
        </div>
      </div>
    </section>
  );
};

export default Benefits;