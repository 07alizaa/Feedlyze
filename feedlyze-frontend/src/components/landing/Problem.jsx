import React from 'react';
import { Clock, FileText, BarChart } from 'lucide-react';

const Problem = () => {
  const problems = [
    {
      icon: Clock,
      title: 'Time-Consuming',
      description: 'Manual data entry takes hours of valuable team time that could be spent elsewhere.',
      color: 'text-danger-500',
      bg: 'bg-danger-50',
    },
    {
      icon: FileText,
      title: 'Delayed Analysis',
      description: 'Waiting days or weeks to compile reports removes the ability to act quickly.',
      color: 'text-warning-500',
      bg: 'bg-warning-50',
    },
    {
      icon: BarChart,
      title: 'No Real Insights',
      description: 'Spreadsheets give you raw numbers, but they miss the "why" behind customer feelings.',
      color: 'text-primary-500',
      bg: 'bg-primary-50',
    },
  ];

  return (
    <section className="py-24 bg-light-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl">
            Paper Feedback Forms Are Broken
          </h2>
          <p className="mt-4 text-xl text-dark-500">
            Traditional methods are slow, error-prone, and don't provide the insights you need to grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-card-hover transition-all duration-300 border border-light-200 text-center"
            >
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${item.bg}`}>
                <item.icon className={`w-8 h-8 ${item.color}`} />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-4">{item.title}</h3>
              <p className="text-dark-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
