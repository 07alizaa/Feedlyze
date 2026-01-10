import { motion } from 'framer-motion';
import { QrCode, Sparkles, BarChart3, Shield, ArrowRight, CheckCircle, Smartphone, FileText } from 'lucide-react';
import Button from '../common/Button';

const Hero = () => {
  const processSteps = [
    {
      icon: QrCode,
      title: "Digitize Feedback",
      description: "Generate unique QR codes for physical locations to collect digital feedback"
    },
    {
      icon: Sparkles,
      title: "AI Analysis",
      description: "Automatically analyze sentiment and categorize responses"
    },
    {
      icon: BarChart3,
      title: "Actionable Insights",
      description: "View organized feedback trends in your dashboard"
    }
  ];

  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-gradient-to-b from-white to-light-50">
      {/* Background Elements - Subtle grid pattern */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-5">
        <div className="absolute top-1/4 -left-12 w-64 h-64 bg-primary-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-12 w-64 h-64 bg-success-100 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-6"
            >
              <Shield className="w-4 h-4" />
              GDPR Compliant Feedback Collection
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl lg:text-5xl xl:text-6xl font-bold text-dark-900 leading-tight tracking-tight mb-6"
            >
              From Paper Feedback to{' '}
              <span className="text-primary-600">Digital Insights</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg lg:text-xl text-dark-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Feedlyze helps businesses digitize paper-based feedback using QR codes, analyze responses with AI, and turn customer insights into actionable improvements.
            </motion.p>

            {/* Process Steps - Mobile View */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col gap-4 mb-8 lg:hidden"
            >
              {processSteps.map((step, index) => (
                <div key={step.title} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-light-200 shadow-card">
                  <div className={`p-3 rounded-lg ${index === 0 ? 'bg-primary-50 text-primary-600' : index === 1 ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600'}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-dark-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-dark-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
            >
              <Button size="xl" variant="primary" className="w-full sm:w-auto">
                Create Your First Survey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="xl" variant="outline" className="w-full sm:w-auto text-dark-600 border-light-300">
                See How It Works
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm font-medium text-dark-500"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-light-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>No manual data entry</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-light-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Privacy-first collection</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-light-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Export your data anytime</span>
              </div>
            </motion.div>
          </div>

          {/* Visual Representation - Realistic Process Flow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-lg lg:max-w-none"
          >
            <div className="relative bg-white rounded-2xl shadow-card p-6 border border-light-200">
              
              {/* Process Steps - Desktop View */}
              <div className="hidden lg:flex flex-col gap-6 mb-8">
                {processSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${index === 0 ? 'bg-primary-50 text-primary-600' : index === 1 ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600'}`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-900 mb-1">{step.title}</h3>
                      <p className="text-sm text-dark-500">{step.description}</p>
                    </div>
                    {index < 2 && (
                      <div className="ml-auto text-dark-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* QR Code Generation Example */}
              <div className="space-y-4">
                <h4 className="font-medium text-dark-900">How It Works</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-light-50 rounded-lg border border-light-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="font-medium text-dark-900">Scan QR Code</span>
                    </div>
                    <p className="text-sm text-dark-500">Customers scan your unique QR code to submit feedback digitally</p>
                  </div>
                  
                  <div className="p-4 bg-light-50 rounded-lg border border-light-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-success-600" />
                      </div>
                      <span className="font-medium text-dark-900">Digital Responses</span>
                    </div>
                    <p className="text-sm text-dark-500">Feedback collected instantly in your dashboard, no paper handling</p>
                  </div>
                </div>
                
                {/* Simple QR Visualization */}
                <div className="mt-6 p-4 border border-light-200 rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-dark-700">Your Feedback QR Code</span>
                    <span className="text-xs text-primary-600 font-medium">Ready to print</span>
                  </div>
                  <div className="flex justify-center p-4 bg-light-50 rounded-lg">
                    <div className="relative">
                      {/* Abstract QR representation */}
                      <div className="w-32 h-32 bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-lg">
                        <div className="absolute top-3 left-3 w-6 h-6 bg-primary-500 rounded-sm"></div>
                        <div className="absolute top-3 right-3 w-6 h-6 bg-primary-500 rounded-sm"></div>
                        <div className="absolute bottom-3 left-3 w-6 h-6 bg-primary-500 rounded-sm"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-center text-dark-500 mt-3">
                    Place this code anywhere to collect digital feedback
                  </p>
                </div>
              </div>

              {/* Simple Stats - Truthful representation */}
              <div className="mt-6 pt-6 border-t border-light-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-dark-900">1</div>
                    <div className="text-dark-500">QR Code</div>
                  </div>
                  <div className="h-8 w-px bg-light-300"></div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-dark-900">∞</div>
                    <div className="text-dark-500">Responses</div>
                  </div>
                  <div className="h-8 w-px bg-light-300"></div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-dark-900">0</div>
                    <div className="text-dark-500">Paper Waste</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;