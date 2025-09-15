import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, User, Lock } from 'lucide-react';

const LoginForm = ({ onLogin, onForgotPassword, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 transform hover:scale-110 transition-transform duration-300">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <p className="text-slate-400 mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-white shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-300 hover:underline"
          >
            Forgot your password?
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;