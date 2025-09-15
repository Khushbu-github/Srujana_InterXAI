import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock, User, Shield } from 'lucide-react';

const ForgotPasswordForm = ({ 
  step, 
  onSendCode, 
  onVerifyCode, 
  onResetPassword, 
  onResendCode, 
  onBackToLogin, 
  isLoading 
}) => {
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getStepIcon = () => {
    switch (step) {
      case 1: return <Mail className="w-6 h-6" />;
      case 2: return <Shield className="w-6 h-6" />;
      case 3: return <Lock className="w-6 h-6" />;
      default: return <User className="w-6 h-6" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Reset Password';
      case 2: return 'Verify Code';
      case 3: return 'New Password';
      default: return 'Reset Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Enter your username to receive a reset code';
      case 2: return 'Enter the verification code sent to your email';
      case 3: return 'Create your new password';
      default: return 'Enter your username to receive a reset code';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (step === 1) {
      onSendCode(username);
    } else if (step === 2) {
      onVerifyCode(code);
    } else if (step === 3) {
      if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      onResetPassword(newPassword, confirmPassword);
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      switch (step) {
        case 1: return 'Sending...';
        case 2: return 'Verifying...';
        case 3: return 'Resetting...';
        default: return 'Loading...';
      }
    } else {
      switch (step) {
        case 1: return 'Send Code';
        case 2: return 'Verify Code';
        case 3: return 'Reset Password';
        default: return 'Continue';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 transform hover:scale-110 transition-transform duration-300">
          {getStepIcon()}
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          {getStepTitle()}
        </h2>
        <p className="text-slate-400 mt-2">
          {getStepDescription()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
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
        )}

        {step === 2 && (
          <>
            <div className="relative group">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="text"
                placeholder="Verification Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-slate-400 text-center text-lg tracking-widest"
                required
              />
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => onResendCode(username)}
                disabled={isLoading}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-300 hover:underline disabled:opacity-50"
              >
                Resend verification code
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-white shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{getButtonText()}</span>
            </div>
          ) : (
            getButtonText()
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;