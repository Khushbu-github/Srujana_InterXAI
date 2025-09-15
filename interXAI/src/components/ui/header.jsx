import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ viewerType: propViewerType }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [viewerType, setViewerType] = useState('guest');
  const [orgId, setOrgId] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  const token = localStorage.getItem('authToken');

  const isOrgDashboardPage = location.pathname.startsWith('/org-dashboard');
  const isOrgRegisterPage = location.pathname === '/register-org';
  const isDefaultPage = ['/', '/login', '/signup', '/about'].includes(location.pathname);
const baseUrl=import.meta.env.VITE_API_URL;
  useEffect(() => {
    if (!token) {
      setViewerType('guest');
    } else if (propViewerType === 'owner') {
      setViewerType('owner');
    } else {
      setViewerType('authenticated');
    }

    if (token) {
      // Check profile
      fetch(`${baseUrl}/users/get-id/`, {
        headers: { Authorization: `Token ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setHasProfile(true);
        })
        .catch(() => setHasProfile(false));

      // Check organization
      fetch(`${baseUrl}/organization/get-org-id/`, {
        headers: { Authorization: `Token ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.organization_id) {
            setOrgId(data.organization_id);
          } else {
            setOrgId(null); // gracefully handle non-org users
          }
        })
        .catch(() => setOrgId(null));
    }
  }, [location.pathname, propViewerType, token]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setViewerType('guest');
    navigate('/login');
  };

  const handleBackToProfile = async () => {
    try {
      const res = await fetch(`${baseUrl}/users/get-id/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/profile/${data.profile_id}`);
      }
    } catch (err) {
      console.error("Error navigating to profile:", err);
    }
  };

  return (
    <div className="w-full flex justify-center pt-6 px-4">
      <nav className="flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-xl rounded-full shadow-lg border border-gray-100 max-w-6xl w-full">
        <div className="flex items-center space-x-3">
          <div className="flex relative">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full -ml-3"></div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            InterXAI
          </span>
        </div>

        <div className="flex items-center space-x-8">
          <a href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
            Features
          </a>

          <a href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
            How It Works
          </a>

          {/* -------- OWNER -------- */}
          {viewerType === 'owner' && (
            <>
              {isOrgDashboardPage ? (
                <>
                  <button
                    onClick={handleBackToProfile}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Back to Profile
                  </button>
                  <a
                    href="/interview"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Set Interview
                  </a>
                </>
              ) : orgId ? (
                <a
                  href={`/org-dashboard/${orgId}`}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                 go to organization
                </a>
              ) : (
                <a
                  href="/register-org"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Register as Organization
                </a>
              )}
            </>
          )}

          {/* -------- AUTHENTICATED -------- */}
          {viewerType === 'authenticated' && hasProfile && (
            <>
              {(isOrgDashboardPage || isOrgRegisterPage) ? (
                <button
                  onClick={handleBackToProfile}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Back to Profile
                </button>
              ) : orgId ? (
                <a
                  href={`/org-dashboard/${orgId}`}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Go to Organization
                </a>
              ) : (
                <a
                  href="/register-org"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Register as Organization
                </a>
              )}
            </>
          )}

          {/* -------- GUEST -------- */}
          {viewerType === 'guest' && (
            <>
              <a href="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Login
              </a>
            </>
          )}

          {/* Logout button for authenticated users */}
          {(viewerType === 'owner' || (viewerType === 'authenticated' && hasProfile)) && (
            <button 
              onClick={handleLogout} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          )}

          {/* Sign up button for guests */}
          {viewerType === 'guest' && (
            <a 
              href="/signup" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Sign Up
            </a>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Header;