import React, { useState, useEffect } from 'react';
import { 
  Brain, Code, Users, Target, Zap, Trophy, 
  MessageCircle, BarChart3, Award, Network, 
  FileText, Video, TrendingUp, Clock, 
  CheckCircle, ArrowRight, Star, Sparkles,
  Layers, GitBranch, Gauge, Shield, Lightbulb,
  PieChart, Activity, BookOpen, Medal
} from 'lucide-react';
import Header from '../components/ui/header';
import Footer from '../components/ui/footer';

const About = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 11);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Code,
      title: "AI-Powered Coding Tests",
      description: "Randomized questions with integrated code editor and automated evaluation",
      color: "from-purple-500 to-blue-500"
    },
    {
      icon: Target,
      title: "Intelligent Career Roadmaps",
      description: "Domain-specific learning paths with progress tracking and adaptive learning",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: MessageCircle,
      title: "Real-Time Mock Interviews",
      description: "AI-simulated interviews with speech analysis and facial expression detection",
      color: "from-cyan-500 to-green-500"
    },
    {
      icon: Users,
      title: "Structured Job Postings",
      description: "Employer dashboard with AI matching system and application tracking",
      color: "from-green-500 to-yellow-500"
    },
    {
      icon: BarChart3,
      title: "Interview Analytics",
      description: "Company-specific archives with trend analysis and performance comparison",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Trophy,
      title: "Leaderboard System",
      description: "Ranked scoring based on performance with achievement badges",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Network,
      title: "Community Engagement",
      description: "Discussion forums, peer reviews, and expert mentorship connections",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: FileText,
      title: "Resume Analyzer",
      description: "AI-powered resume analysis with ATS optimization and impact scoring",
      color: "from-pink-500 to-purple-500"
    },
    {
      icon: Video,
      title: "Video Summarizer",
      description: "Extract key insights from industry videos and generate Q&A discussions",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: TrendingUp,
      title: "Advanced Insights",
      description: "Heatmap performance tracking with behavioral and technical evaluation",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: BookOpen,
      title: "Personalized Learning",
      description: "AI-driven adaptive paths with skill-based recommendations",
      color: "from-blue-500 to-cyan-500"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users", icon: Users },
    { number: "1M+", label: "Interviews Conducted", icon: MessageCircle },
    { number: "95%", label: "Success Rate", icon: Trophy },
    { number: "500+", label: "Partner Companies", icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" style={{ fontFamily: 'Madefor, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <Header />
      {/* Hero Section */}
      <section className="relative px-16 py-32 min-h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            
            {/* Floating Stats */}
            <div className="flex flex-wrap items-center gap-6 mb-12">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-500">
                    <Icon className="w-5 h-5 text-purple-300" />
                    <span className="text-white font-bold text-lg">{stat.number}</span>
                    <span className="text-gray-300">{stat.label}</span>
                  </div>
                );
              })}
            </div>

            <h1 className="text-8xl font-black text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text mb-8 leading-tight">
              Revolutionizing
              <br />
              <span className="text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text">
                Recruitment
              </span>
            </h1>
            
            <p className="text-2xl text-gray-200 mb-12 leading-relaxed max-w-4xl">
              InterXAI bridges the gap between traditional interview preparation and real-world hiring processes. 
              Our AI-powered platform provides personalized recruitment experiences for both candidates and employers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/20">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">For Candidates</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Receive instant feedback on your performance and improve your skills in a realistic, 
                  interactive environment with AI-powered coaching.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">For Employers</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Seamlessly evaluate candidates using intelligent tools that highlight key strengths 
                  and weaknesses for informed hiring decisions.
                </p>
              </div>
            </div>

            <div className="text-center">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-6 rounded-full text-2xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/30 flex items-center space-x-3 mx-auto">
                <span>Explore Our Platform</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-slow-float"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl animate-slow-float-delayed"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-16 py-32 bg-gradient-to-br from-slate-800/50 to-purple-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-7xl font-black text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text mb-8">
              Revolutionary Features
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              Experience the most comprehensive AI-powered recruitment platform with cutting-edge features 
              designed to transform how interviews and hiring work.
            </p>
          </div>

          {/* Interactive Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <div 
                  key={index}
                  className={`group relative bg-gradient-to-br from-slate-900/50 to-purple-900/30 backdrop-blur-sm rounded-3xl p-8 border transition-all duration-700 hover:transform hover:scale-105 cursor-pointer ${
                    isActive 
                      ? 'border-purple-400/70 shadow-2xl shadow-purple-500/30 scale-105' 
                      : 'border-purple-500/20 hover:border-purple-400/50'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 ${isActive ? 'rotate-12 scale-110' : ''}`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 text-center group-hover:text-purple-200 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 text-center leading-relaxed group-hover:text-gray-200 transition-colors">
                    {feature.description}
                  </p>

                  {isActive && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detailed Feature Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            
            {/* AI-Powered Coding Tests */}
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-3xl p-10 border border-purple-500/20">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white">AI-Powered Coding Tests</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: Layers, text: "20 randomized questions from 40+ question pool" },
                  { icon: Code, text: "Integrated code editor with syntax highlighting" },
                  { icon: Brain, text: "Automated evaluation using Grok AI" },
                  { icon: Clock, text: "Live timer for timely submissions" },
                  { icon: CheckCircle, text: "Real-time feedback on test case results" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5 text-purple-300" />
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard System */}
            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-3xl p-10 border border-blue-500/20">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white">Competitive Leaderboard</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: Gauge, text: "Score-based ranking (Max 100 points)" },
                  { icon: Clock, text: "Time-based performance metrics" },
                  { icon: Medal, text: "Achievement badges and milestones" },
                  { icon: TrendingUp, text: "Performance trend tracking" },
                  { icon: Award, text: "Top performer recognition system" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5 text-blue-300" />
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-gradient-to-r from-slate-900/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/20 mb-20">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-white mb-4">Powered by Advanced AI</h3>
              <p className="text-xl text-gray-300">
                Our platform leverages cutting-edge artificial intelligence to deliver unparalleled interview experiences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Grok AI Integration</h4>
                <p className="text-gray-300">Advanced language model for intelligent evaluation and feedback</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Real-Time Analysis</h4>
                <p className="text-gray-300">Live speech and behavioral pattern recognition technology</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <PieChart className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Predictive Analytics</h4>
                <p className="text-gray-300">Machine learning algorithms for performance prediction</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/20">
              <h3 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Career?</h3>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Join thousands of professionals who have already elevated their interview skills and landed their dream jobs with InterXAI.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white px-12 py-6 rounded-full text-2xl font-bold hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/30">
                  Start Your Journey
                </button>
                
                <div className="flex items-center space-x-2 text-gray-300">
                  <div className="flex -space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-lg">Trusted by 50,000+ users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slow-float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(-10px) translateX(-10px); }
        }
        @keyframes slow-float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(15px) translateX(-15px); }
          66% { transform: translateY(-25px) translateX(5px); }
        }
        
        .animate-slow-float {
          animation: slow-float 8s ease-in-out infinite;
        }
        .animate-slow-float-delayed {
          animation: slow-float-delayed 10s ease-in-out infinite;
        }
      `}</style>
       <Footer />
    </div>
    
  );
};

export default About;