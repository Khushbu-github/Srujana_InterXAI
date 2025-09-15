"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from '../components/ui/header';
import Footer from '../components/ui/footer';
import ProfileForm from "../components/forms/ProfileForm";
import { getAuthToken } from "../utils/handleToken";
import { toast} from 'react-toastify';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    photo: "",
    bio: "",
    github: "",
    leetcode: "",
  });

  const [loading, setLoading] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // 🔐 Ensure user is authenticated
  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      const email = sessionStorage.getItem("email");
      const password = sessionStorage.getItem("password");

      if (email && password) {
        // Try logging in
        fetch(`${API_URL}/users/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.token) {
              localStorage.setItem("authToken", data.token);
            } else {
              toast.error("Login failed. Please sign in again.");
              navigate("/signin");
            }
          })
          .catch(() => {
            toast.error("Error logging in.");
            navigate("/signin");
          })
          .finally(() => setTokenChecked(true));
      } else {
        navigate("/signin");
      }
    } else {
      setTokenChecked(true);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getAuthToken();

    try {
      const response = await fetch(`${API_URL}/users/profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        const idRes = await fetch(`${API_URL}/users/get-id/`, {
          headers: { Authorization: `Token ${token}` },
        });

        const idData = await idRes.json();

        if (idData.success) {
          navigate(`/profile/${idData.profile_id}`);
        } else {
          toast.error("Profile saved, but couldn't retrieve user ID.");
        }
      } else {
        toast.error("Failed to save profile: " + JSON.stringify(data.errors));
      }
    } catch (error) {
      toast.error("Server error while saving profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!tokenChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          {/* Header Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-lg border border-purple-400/30 rounded-full px-6 py-3 mb-8">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span className="text-purple-300 font-medium">AI-Powered Profile Setup</span>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Profile</span>
              <br />
              <span className="text-white">with AI Optimization</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals optimizing their profiles with
              personalized AI assistance, real-time suggestions, and industry-specific guidance.
            </p>
          </div>

          {/* Profile Form Section */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="bg-slate-800/60 backdrop-blur-lg border border-purple-500/20 rounded-3xl shadow-2xl p-8">
              <ProfileForm
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                loading={loading}
              />
            </div>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {/* AI Optimization */}
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-400/30 rounded-2xl p-6 hover:border-purple-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                <div className="bg-purple-500/20 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-purple-300 mb-2">AI Profile Optimization</h3>
                <p className="text-gray-400 text-sm">Smart suggestions to enhance your professional profile</p>
              </div>
            </div>

            {/* Real-time Feedback */}
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-2xl p-6 hover:border-blue-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="bg-blue-500/20 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-blue-300 mb-2">Real-Time Feedback</h3>
                <p className="text-gray-400 text-sm">Instant validation and improvement suggestions</p>
              </div>
            </div>

            {/* Industry Preparation */}
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-400/30 rounded-2xl p-6 hover:border-green-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
                <div className="bg-green-500/20 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-300 mb-2">Industry Preparation</h3>
                <p className="text-gray-400 text-sm">Tailored content for your specific industry needs</p>
              </div>
            </div>

            {/* Performance Analytics */}
            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-400/30 rounded-2xl p-6 hover:border-orange-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
                <div className="bg-orange-500/20 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-orange-300 mb-2">Performance Analytics</h3>
                <p className="text-gray-400 text-sm">Track your profile's performance and engagement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}