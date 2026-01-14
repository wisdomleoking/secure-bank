
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 mt-auto">
      <div className="max-w-8xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 w-12 h-12 rounded-xl flex items-center justify-center">
                <i className="fas fa-shield-alt text-white text-xl"></i>
              </div>
              <div>
                <span className="text-2xl font-bold">SecureBank</span>
                <span className="text-xs font-medium text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full ml-2">2025 EDITION</span>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">Your AI-powered financial partner. Banking reimagined with radical UX, military-grade security, and intelligent financial management.</p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"><i className="fab fa-twitter"></i></a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          
          <div>
            <h3 class="font-semibold text-lg mb-6">Products</h3>
            <ul class="space-y-3 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">Personal Banking</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Business Banking</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Wealth Management</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold text-lg mb-6">Features</h3>
            <ul class="space-y-3 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">AI Insights</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Biometric Security</a></li>
              <li><a href="#" class="hover:text-white transition-colors">ESG Dashboard</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold text-lg mb-6">Company</h3>
            <ul class="space-y-3 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2025 SecureBank. All rights reserved. Member FDIC. Equal Housing Lender.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
