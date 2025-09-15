import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const NotificationMessage = ({ message, messageType }) => {
  const getMessageIcon = () => {
    switch (messageType) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <AlertCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  if (!message) return null;

  return (
    <div className={`fixed top-6 right-6 max-w-sm p-4 rounded-xl shadow-2xl border backdrop-blur-xl transform transition-all duration-500 z-50 ${
      messageType === 'success' 
        ? 'bg-green-900/80 border-green-500/50 text-green-100' 
        : messageType === 'error'
        ? 'bg-red-900/80 border-red-500/50 text-red-100'
        : 'bg-blue-900/80 border-blue-500/50 text-blue-100'
    } animate-slide-in`}>
      <div className="flex items-center space-x-3">
        {getMessageIcon()}
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default NotificationMessage;