import React from 'react';
import Button from '../common/Button';

const CallToAction = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-800 text-white text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold sm:text-5xl mb-6">
          Experience Digital Feedback Collection
        </h2>
        <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
          Try Feedlyze to see how QR-based surveys can modernize feedback collection
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="xl" variant="secondary" className="shadow-xl text-primary-700 hover:text-primary-800">
            Try Feedlyze
          </Button>
          <Button size="xl" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10">
            View Demo
          </Button>
        </div>
        <p className="mt-6 text-sm text-primary-200 opacity-80">
          Academic project demonstrating digital transformation concepts
        </p>
      </div>
    </section>
  );
};

export default CallToAction;