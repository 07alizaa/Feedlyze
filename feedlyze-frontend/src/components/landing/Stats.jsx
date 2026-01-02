import React from 'react';

const Stats = () => {
  const stats = [
    { label: 'Businesses', value: '500+' },
    { label: 'Responses Analyzed', value: '50,000+' },
    { label: 'Satisfaction Rate', value: '98%' },
    { label: 'Response Rate', value: '92%' },
    { label: 'App Store Rating', value: '4.9/5.0' },
    { label: 'Avg Survey Completion', value: '<1 min' },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold opacity-90">
            Trusted by Businesses Worldwide
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-extrabold mb-2">{stat.value}</div>
              <div className="text-sm lg:text-base opacity-80 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
