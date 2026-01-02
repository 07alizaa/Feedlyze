import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Cafe Owner',
      content: 'Feedlyze transformed how we understand our customers. The AI insights helped us improve our menu and service quality.',
      rating: 5,
    },
    {
      name: 'Mike Johnson',
      role: 'Hotel Manager',
      content: "We've seen a 40% increase in feedback response rates since switching to QR codes. The real-time analytics are game-changing.",
      rating: 5,
    },
    {
      name: 'Lisa Kumar',
      role: 'Gym Owner',
      content: 'Setup was so easy, and the AI insights are pure gold. We now know exactly what our members love and what needs improvement.',
      rating: 5,
    }
  ];

  return (
    <section className="py-24 bg-light-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl">
            What Our Customers Are Saying
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-light-200 flex flex-col h-full">
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning-400 text-warning-400" />
                ))}
              </div>
              <blockquote className="text-dark-700 text-lg mb-6 flex-grow">
                "{t.content}"
              </blockquote>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-dark-900">{t.name}</div>
                  <div className="text-sm text-dark-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
