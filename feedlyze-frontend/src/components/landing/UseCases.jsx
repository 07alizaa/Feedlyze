import React from 'react';
import { Utensils, Building, Dumbbell, ShoppingBag, HeartPulse, GraduationCap } from 'lucide-react';

const UseCases = () => {
  const industries = [
    { icon: <Utensils className="w-8 h-8 text-primary-500" />, title: 'Restaurants', description: 'Menu feedback & service quality' },
    { icon: <Building className="w-8 h-8 text-primary-500" />, title: 'Hotels', description: 'Guest satisfaction & amenities' },
    { icon: <Dumbbell className="w-8 h-8 text-primary-500" />, title: 'Fitness', description: 'Member experience & classes' },
    { icon: <ShoppingBag className="w-8 h-8 text-primary-500" />, title: 'Retail', description: 'Shopping experience & products' },
    { icon: <HeartPulse className="w-8 h-8 text-primary-500" />, title: 'Healthcare', description: 'Patient care & appointments' },
    { icon: <GraduationCap className="w-8 h-8 text-primary-500" />, title: 'Education', description: 'Course feedback & learning' },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl">
            Perfect For Every Industry
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {industries.map((industry, index) => (
            <div
              key={index}
              className="group p-8 bg-white rounded-2xl border border-light-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-colors transform group-hover:scale-110 duration-300">
                {industry.icon}
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-2">{industry.title}</h3>
              <p className="text-dark-500 font-medium">{industry.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
