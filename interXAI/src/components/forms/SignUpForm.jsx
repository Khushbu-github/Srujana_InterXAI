import React from 'react';
import { Eye, EyeOff, Loader2, User, Mail, Lock } from 'lucide-react';

const SignUpForm = ({ 
  username, 
  setUsername, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  confirmPassword, 
  setConfirmPassword, 
  showPassword, 
  setShowPassword, 
  showConfirmPassword, 
  setShowConfirmPassword, 
  handleSignUp, 
  isLoading 
}) => {
  return (
    <div className="bg-slate-800/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-shimmer"></div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 transform hover:scale-110 transition-transform duration-300">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          Create Your Account
        </h2>
        <p className="text-slate-400 mt-2">Join InterXAI today</p>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-slate-400"
            required
          />
        </div>
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-slate-400"
            required
          />
        </div>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-slate-400"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-slate-400"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <button
          onClick={handleSignUp}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-white shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing up...</span>
            </div>
          ) : (
            'Sign Up'
          )}
        </button>
      </div>
    </div>
  );
};

export default SignUpForm;