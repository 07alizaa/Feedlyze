import { motion } from 'framer-motion';
import { Play, CheckCircle, ArrowRight, BarChart2, MessageSquare, TrendingUp } from 'lucide-react';
import Button from '../common/Button'; // Assuming default export

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-primary-50 to-white">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-success-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl lg:text-6xl font-extrabold text-dark-900 leading-tight tracking-tight mb-6"
            >
              Transform Paper <br className="hidden lg:block" />
              <span className="text-primary-600">Feedback</span> Into <br className="hidden lg:block" />
              <span className="text-success-600">Actionable Insights</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg lg:text-xl text-dark-500 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              AI-powered feedback analysis that helps businesses understand their customers and grow faster. No more manual data entry.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10"
            >
              <Button size="xl" variant="primary" className="w-full sm:w-auto shadow-xl shadow-primary-500/20">
                Use Feedlyze Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="xl" variant="ghost" className="w-full sm:w-auto text-dark-600 hover:bg-white/50 border border-transparent hover:border-light-300">
                <Play className="mr-2 w-5 h-5 fill-current" /> Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm font-medium text-dark-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success-500" />
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success-500" />
                <span>Trusted by 500+ businesses</span>
              </div>
            </motion.div>
          </div>

          {/* Visual Mockup - Dashboard Illusion */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative perspective-1000">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: 10, rotateX: 5 }}
              animate={{ opacity: 1, scale: 1, rotateY: -10, rotateX: 5 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative bg-white rounded-2xl shadow-2xl border border-light-200 p-4 lg:p-6 transform transition-transform hover:rotate-0 duration-500"
              style={{ transformStyle: 'preserve-3d', transform: 'perspective(1000px) rotateY(-12deg) rotateX(6deg)' }}
            >
              {/* Fake Dashboard Header */}
              <div className="flex items-center justify-between mb-6 border-b border-light-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold">F</div>
                  <div className="font-bold text-dark-900">Dashboard</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-24 h-8 bg-light-100 rounded animate-pulse"></div>
                  <div className="w-8 h-8 bg-light-100 rounded-full"></div>
                </div>
              </div>

              {/* Fake Charts */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-100">
                  <div className="flex items-center gap-2 mb-2 text-primary-700 font-medium text-sm">
                    <TrendingUp className="w-4 h-4" /> Sentiment Score
                  </div>
                  <div className="text-3xl font-bold text-dark-900">+0.85</div>
                  <div className="text-xs text-success-600 font-medium flex items-center mt-1">
                    ↑ 12% this week
                  </div>
                </div>
                <div className="bg-success-50/50 p-4 rounded-xl border border-success-100">
                  <div className="flex items-center gap-2 mb-2 text-success-700 font-medium text-sm">
                    <MessageSquare className="w-4 h-4" /> New Responses
                  </div>
                  <div className="text-3xl font-bold text-dark-900">128</div>
                  <div className="text-xs text-success-600 font-medium flex items-center mt-1">
                    ↑ 24 today
                  </div>
                </div>
              </div>

              {/* Fake List */}
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-light-50 rounded-lg border border-light-100">
                    <div className="w-8 h-8 rounded-full bg-light-200 flex-shrink-0"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-light-200 rounded w-3/4"></div>
                      <div className="h-3 bg-light-200 rounded w-1/2"></div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${i === 1 ? 'bg-success-100 text-success-700' : 'bg-primary-100 text-primary-700'}`}>
                      {i === 1 ? 'Positive' : 'Neutral'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating Elements Animations */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -right-8 top-20 bg-white p-3 rounded-xl shadow-lg border border-light-200 flex items-center gap-3 z-20"
              >
                <div className="bg-primary-100 p-2 rounded-lg">
                  <BarChart2 className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="text-xs text-dark-500">Analysis Complete</div>
                  <div className="text-sm font-bold text-dark-900">Insight Ready</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute -left-6 bottom-32 bg-white p-3 rounded-xl shadow-lg border border-light-200 flex items-center gap-3 z-20"
              >
                <div className="bg-success-100 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <div className="text-xs text-dark-500">New Feedback</div>
                  <div className="text-sm font-bold text-dark-900">Just Now</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
