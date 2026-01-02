import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Problem from '../components/landing/Problem';
import HowItWorks from '../components/landing/HowItWorks';
import Features from '../components/landing/Features';
import Testimonials from '../components/landing/Testimonials';
import Stats from '../components/landing/Stats';
import UseCases from '../components/landing/UseCases';
import Pricing from '../components/landing/Pricing';
import FAQ from '../components/landing/FAQ';
import CallToAction from '../components/landing/CallToAction';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="font-sans text-dark-900 bg-white">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Stats />
        <UseCases />
        <Pricing />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
