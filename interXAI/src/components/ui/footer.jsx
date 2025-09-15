import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-black to-slate-900 text-white border-t border-purple-500/20">
      <div className="max-w-7xl mx-auto px-16 py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex relative">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full -ml-4"></div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">InterXAI</span>
            </div>
            <p className="text-gray-300 max-w-lg mb-8 text-lg leading-relaxed">
              The world's most advanced AI interview platform. Join thousands of professionals 
              who've transformed their careers with our cutting-edge technology.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-purple-300 transition-colors text-lg">Twitter</a>
              <a href="#" className="text-gray-300 hover:text-purple-300 transition-colors text-lg">LinkedIn</a>
              <a href="#" className="text-gray-300 hover:text-purple-300 transition-colors text-lg">GitHub</a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xl font-semibold mb-8 text-purple-300">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">AI Interviews</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">Feedback System</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">Progress Tracking</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">Mobile App</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xl font-semibold mb-8 text-purple-300">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">Success Stories</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">Contact</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg">Careers</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-16 pt-12 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-lg">
            © 2025 InterXAI. Revolutionizing interviews worldwide.
          </p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-purple-300 text-lg transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-purple-300 text-lg transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-purple-300 text-lg transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;