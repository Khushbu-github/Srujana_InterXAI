"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight, Star, Users, Trophy, Zap, MessageCircle, Brain, Target } from 'lucide-react';
import Header from '../components/ui/header';
import Footer from '../components/ui/footer';
import { getAuthToken } from '../utils/handleToken';
import { toast} from 'react-toastify';


const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Redirect if token is found
    const token = getAuthToken();
    const API_URL = import.meta.env.VITE_API_URL;
    if (token) {
      fetch(`${API_URL}/users/get-id/`, {
        headers: { Authorization: `Token ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.profile_id) {
            navigate(`/profile/${data.profile_id}`);
          }
        })
        .catch(err => {
          toast.error("Redirect error:", err);
          localStorage.removeItem("authToken");
        });
    }

    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, [navigate]);

  const stats = [
    { number: "95%", label: "Success Rate", icon: Trophy },
    { number: "50K+", label: "Users Trained", icon: Users },
    { number: "1M+", label: "Interviews Practiced", icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" style={{ fontFamily: 'Madefor, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <Header />
      <div>
        {/* Hero Section */}
        <section className="relative px-16 py-24 min-h-screen flex items-center overflow-hidden">
          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className={`max-w-5xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              {/* Floating Stats */}
              <div className="flex items-center space-x-8 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className={`flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 transition-all duration-500 ${currentStat === index ? 'bg-purple-500/20 border-purple-400/50 scale-105' : ''}`}>
                      <Icon className="w-5 h-5 text-purple-300" />
                      <span className="text-white font-semibold">{stat.number}</span>
                      <span className="text-gray-300 text-sm">{stat.label}</span>
                    </div>
                  );
                })}
              </div>

              <h1 className="text-9xl font-black text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text mb-8 leading-tight">
                Master Any
                <br />
                <span className="text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text animate-pulse">
                  Interview
                </span>
              </h1>

              <p className="text-2xl text-gray-200 mb-12 leading-relaxed max-w-3xl">
                Transform your interview skills with AI-powered practice sessions. Get personalized feedback, 
                realistic scenarios, and the confidence to land your dream job.
              </p>

              <div className="flex items-center space-x-8 text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                </div>
                <div className="h-6 w-px bg-gray-600"></div>
           
              </div>
            </div>

            {/* AI Simulator Preview */}
            <div className="absolute top-1/2 right-16 transform -translate-y-1/2 w-96 h-96">
              <div className="relative w-full h-full">
                <div className="absolute top-8 right-8 bg-gradient-to-r from-purple-500/90 to-blue-500/90 backdrop-blur-sm text-white p-4 rounded-2xl rounded-tr-sm shadow-2xl animate-float">
                  <p className="text-sm font-medium">"Tell me about yourself"</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Brain className="w-4 h-4" />
                    <span className="text-xs opacity-75">AI Interviewer</span>
                  </div>
                </div>

                <div className="absolute top-32 right-24 bg-white/90 backdrop-blur-sm text-gray-800 p-4 rounded-2xl rounded-br-sm shadow-2xl animate-float-delayed">
                  <p className="text-sm font-medium">"I'm passionate about..."</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <MessageCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-xs opacity-75">You</span>
                  </div>
                </div>

                <div className="absolute bottom-16 right-12 bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-sm text-white p-4 rounded-2xl shadow-2xl animate-float">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">Real-time Feedback</span>
                  </div>
                  <p className="text-xs mt-1 opacity-90">Great eye contact! 👍</p>
                </div>

                <div className="absolute inset-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/20 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-12 right-8 w-24 h-24 bg-blue-400/20 rounded-full animate-pulse delay-500"></div>
                  <div className="absolute top-1/2 right-1/2 w-40 h-40 bg-cyan-400/10 rounded-full animate-pulse delay-1000"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Background Blobs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-full blur-3xl animate-slow-float"></div>
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-blue-600/30 to-cyan-600/30 rounded-full blur-3xl animate-slow-float-delayed"></div>
            <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-slow-pulse"></div>
          </div>
        </section>

        {/* Animations */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(2deg); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(-2deg); }
          }
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
          @keyframes slow-pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
          }

          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-float-delayed { animation: float-delayed 3s ease-in-out infinite; animation-delay: 1s; }
          .animate-slow-float { animation: slow-float 8s ease-in-out infinite; }
          .animate-slow-float-delayed { animation: slow-float-delayed 10s ease-in-out infinite; }
          .animate-slow-pulse { animation: slow-pulse 4s ease-in-out infinite; }
        `}</style>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
