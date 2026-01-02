import React from 'react';
import Button from '../common/Button';

const CallToAction = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-800 text-white text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold sm:text-5xl mb-6">
          Ready to Transform Your Feedback Process?
        </h2>
        <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
          Join 500+ businesses growing with AI-powered insights. Setup your first survey in 5 minutes.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="xl" variant="secondary" className="shadow-xl text-primary-700 hover:text-primary-800">
            Get Started Free
          </Button>
        </div>
        <p className="mt-6 text-sm text-primary-200 opacity-80">
          No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default CallToAction;
