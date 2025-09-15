import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const MessageNotification = ({ message, messageType, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  const getMessageIcon = () => {
    switch (messageType) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <AlertCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getMessageStyles = () => {
    switch (messageType) {
      case 'success': 
        return 'bg-green-900/80 border-green-500/50 text-green-100';
      case 'error':
        return 'bg-red-900/80 border-red-500/50 text-red-100';
      default:
        return 'bg-blue-900/80 border-blue-500/50 text-blue-100';
    }
  };

  if (!message) return null;

  return (
    <div className={`fixed top-6 right-6 max-w-sm p-4 rounded-xl shadow-2xl border backdrop-blur-xl transform transition-all duration-500 z-50 ${getMessageStyles()} animate-slide-in`}>
      <div className="flex items-center space-x-3">
        {getMessageIcon()}
        <p className="text-sm font-medium">{message}</p>
      </div>
      
      <style jsx>{`
        @keyframes slide-in {
          0% { 
            transform: translateX(100%) scale(0.9);
            opacity: 0;
          }
          100% { 
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MessageNotification;