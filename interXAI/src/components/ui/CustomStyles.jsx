import React from 'react';

const CustomStyles = () => {
  return (
    <style jsx>{`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
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
      .animate-shimmer {
        animation: shimmer 3s infinite;
      }
      .animate-slide-in {
        animation: slide-in 0.5s ease-out;
      }
    `}</style>
  );
};

export default CustomStyles;