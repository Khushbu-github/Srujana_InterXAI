import React, { useState, useEffect } from 'react';

const FormContainer = ({ children, isVisible }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 relative z-10">
      <div className={`max-w-md w-full transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="bg-slate-800/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-shimmer"></div>
          
          {children}
          
          <style jsx>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            .animate-shimmer {
              animation: shimmer 3s infinite;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default FormContainer;