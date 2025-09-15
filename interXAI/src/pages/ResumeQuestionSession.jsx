import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuthToken, fetchWithToken } from "../utils/handleToken";
import { Loader2, Send, MessageCircle, User, Sparkles } from "lucide-react";

const ResumeQuestionSession = () => {
  const params = useParams();
  const navigate = useNavigate();
  const token = getAuthToken();
  const { sessionId } = params;
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const hasInitialized = useRef(false);
  const chatEndRef = useRef(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // Enhanced logging for debugging
  const logApiCall = (method, url, body = null) => {
    console.log(`🚀 API Call: ${method} ${url}`);
    if (body) {
      console.log('📦 Request Body:', JSON.stringify(body, null, 2));
    }
    console.log('🔑 Token present:', !!token);
    console.log('🔗 Full URL:', url);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [chatHistory]);

  // Improved helper function to handle API responses
  const handleResponse = (data) => {
    console.log('📥 Handling API response:', data);
    
    // Better validation of response data
    if (!data) {
      throw new Error('Empty response from server');
    }
    
    if (typeof data !== 'object') {
      throw new Error('Invalid response format from server');
    }
    
    // Check for error in response
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Handle completion - check both 'completed' and 'compeletd' (typo in backend)
    if (data.completed === true || data.compeletd === true) {
      console.log('✅ Session completed');
      return { completed: true };
    }
    
    // For ongoing session, ensure we have a question
    if (data.completed === false) {
      if (!data.question) {
        throw new Error('Server indicates session is ongoing but no question provided');
      }
      console.log('❓ New question received:', data.question.substring(0, 100) + '...');
      return { completed: false, question: data.question };
    }
    
    // If we reach here, response format is unexpected
    throw new Error('Unexpected response format from server');
  };

  // Initialize session and fetch first question
  useEffect(() => {
    console.log('🔄 Initializing session...');
    console.log('🔑 Token available:', !!token);
    console.log('📝 Session ID:', sessionId);
    console.log('🌐 API URL:', API_URL);
    
    if (!token) {
      console.log('❌ No token found, redirecting to login');
      navigate("/login");
      return;
    }
    
    if (!sessionId) {
      console.log('❌ No session ID found');
      setError('Session ID is missing. Please try again.');
      setLoading(false);
      return;
    }
    
    if (hasInitialized.current) {
      console.log('⚠️ Already initialized, skipping');
      return;
    }
    
    hasInitialized.current = true;

    const initSession = async () => {
      try {
        const endpoint = `${API_URL}/interview/res-question/${sessionId}/`;
        // Send empty object for initial request
        const requestBody = {};
        
        console.log('🚀 Making initialization request...');
        logApiCall('POST', endpoint, requestBody);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ HTTP Error Response:', errorText);
          
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          } else if (response.status === 404) {
            throw new Error('Session not found. Please start a new session.');
          } else if (response.status === 500) {
            throw new Error('Server error. Please try again in a few moments.');
          } else {
            throw new Error(`Server returned status ${response.status}: ${errorText}`);
          }
        }

        const data = await response.json();
        console.log('✅ Initialization successful');
        console.log('📥 Response data:', data);

        const { completed, question } = handleResponse(data);
        if (completed) {
          console.log('✅ Session already completed');
          setCompleted(true);
        } else {
          console.log('❓ Setting first question');
          setCurrentQuestion(question);
          setShowWelcome(false);
        }
      } catch (err) {
        console.error('❌ Error initializing session:', err);
        console.error('📊 Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        
        // More specific error handling
        if (err.message?.includes('401') || err.message?.includes('Authentication')) {
          setError('Your session has expired. Please log in again.');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.message?.includes('404') || err.message?.includes('not found')) {
          setError('Session not found. Please start a new interview session.');
        } else if (err.message?.includes('500') || err.message?.includes('Server error')) {
          setError('Server is experiencing issues. Please try again in a few moments.');
        } else if (err.name === 'TypeError' && err.message?.includes('fetch')) {
          setError('Unable to connect to server. Please check your internet connection.');
        } else {
          setError(err.message || 'Failed to start resume question session. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [sessionId, token, navigate, API_URL]);

  // Submit answer with improved error handling
  const handleNext = async () => {
    if (!answer.trim()) {
      setError("Please provide an answer before proceeding.");
      return;
    }
    if (answer.length > 5000) {
      setError("Answer is too long. Please keep it under 5000 characters.");
      return;
    }

    console.log('📤 Submitting answer');
    setChatHistory((prev) => [...prev, { question: currentQuestion, answer }]);
    const submittedAnswer = answer.trim();
    setAnswer("");
    setQuestionLoading(true);
    setError(null);

    try {
      const endpoint = `${API_URL}/interview/res-question/${sessionId}/`;
      const requestBody = {
        answer: submittedAnswer
      };

      console.log('🚀 Submitting answer...');
      logApiCall('POST', endpoint, requestBody);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error Response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('Session not found. Please start a new session.');
        } else if (response.status === 400) {
          throw new Error('Invalid request. Please check your answer and try again.');
        } else if (response.status === 500) {
          throw new Error('Server error occurred while processing your answer. Please try again.');
        } else {
          throw new Error(`Server returned status ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Answer submission successful');
      console.log('📥 Response data:', data);

      const { completed, question } = handleResponse(data);
      if (completed) {
        console.log('✅ Session completed after answer submission');
        setCompleted(true);
      } else {
        console.log('❓ Setting next question');
        setCurrentQuestion(question);
      }
    } catch (err) {
      console.error('❌ Error submitting answer:', err);
      console.error('📊 Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      // Restore the answer if submission failed
      setAnswer(submittedAnswer);
      
      // Specific error handling
      if (err.message?.includes('401') || err.message?.includes('Authentication')) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (err.message?.includes('404') || err.message?.includes('not found')) {
        setError("Session not found. Please start a new interview session.");
      } else if (err.message?.includes('400') || err.message?.includes('Invalid request')) {
        setError("There was an issue with your answer. Please try again.");
      } else if (err.message?.includes('500') || err.message?.includes('Server error')) {
        setError("Server error occurred. Please try submitting your answer again.");
      } else if (err.name === 'TypeError' && err.message?.includes('fetch')) {
        setError("Connection error. Please check your internet and try again.");
      } else {
        setError(err.message || "Failed to submit answer. Please try again.");
      }
    } finally {
      setQuestionLoading(false);
    }
  };

  // Redirect after completion
  useEffect(() => {
    if (completed) {
      console.log('🎉 Session completed, redirecting in 3 seconds...');
      setTimeout(() => {
      navigate(sessionId ? `/dsa-interview-platform/${sessionId}` : "/");
      }, 3000);
    }
  }, [completed, navigate]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && answer.trim() && !questionLoading) {
        console.log('⌨️ Keyboard shortcut: Ctrl+Enter');
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [answer, questionLoading]);

  // Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-blue-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping"></div>
            <Loader2 className="relative animate-spin w-12 h-12 text-blue-600" />
          </div>
          <p className="text-lg font-medium">Preparing your resume question round...</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-blue-900">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-blue-200 text-center max-w-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-xl font-semibold text-red-600 mb-4">{error}</p>
          
          {/* Debug Information */}
          <div className="text-left bg-gray-50 p-4 rounded-lg mb-4 text-sm">
            <h4 className="font-semibold mb-2">Debug Information:</h4>
            <p>• Session ID: {sessionId}</p>
            <p>• API URL: {API_URL}</p>
            <p>• Token: {token ? '✅ Present' : '❌ Missing'}</p>
            <p>• Current Time: {new Date().toLocaleString()}</p>
            <p>• User Agent: {navigator.userAgent.substring(0, 50)}...</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                console.log('🔄 User clicked Try Again');
                setError(null);
                setLoading(true);
                hasInitialized.current = false;
                window.location.reload(); // Force a complete refresh
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                console.log('🔙 User clicked Go Back');
                navigate("/dashboard");
              }}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-xl p-12 rounded-3xl border border-blue-200/50 shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-transparent rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-indigo-200 to-transparent rounded-full translate-x-12 translate-y-12"></div>
          <div className="relative z-10">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Sparkles size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
              Resume-Based AI Interview
            </h1>
            <p className="text-blue-700 mb-8 text-lg leading-relaxed">
              Engage in a conversational AI interview based on your resume. Answer questions thoughtfully to showcase your experience and skills.
            </p>
            <button
              onClick={() => {
                console.log('🚀 User clicked Begin Resume Round');
                setShowWelcome(false);
              }}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>Starting...</span>
                </div>
              ) : (
                "Begin Resume Round"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-xl p-12 rounded-3xl border border-green-200/50 shadow-2xl max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-50"></div>
          <div className="relative z-10">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Sparkles size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Resume Round Complete!
            </h1>
            <p className="text-blue-700 text-lg mb-6">
              Thank you for your time. We'll review your responses and get back to you soon.
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Loader2 className="animate-spin w-5 h-5" />
              <span>Redirecting to dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Resume Question UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-blue-200/50 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Resume-Based AI Interview
                </h1>
                <p className="text-sm text-blue-600 mt-1">
                  Question {chatHistory.length + 1}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Chat History Sidebar */}
        <div className="w-1/3 bg-white/60 backdrop-blur-md border-r border-blue-200/50 flex flex-col">
          <div className="p-6 border-b border-blue-200/50">
            <h2 className="text-xl font-bold text-blue-800 flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <span>Conversation</span>
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatHistory.length === 0 ? (
              <div className="text-center text-blue-400 mt-16">
                <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={32} className="text-blue-300" />
                </div>
                <p className="text-lg font-medium mb-2">No messages yet</p>
                <p className="text-sm">Your conversation will appear here as you progress</p>
              </div>
            ) : (
              chatHistory.map((item, index) => (
                <div key={index} className="space-y-4">
                  {/* AI Question */}
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <MessageCircle size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-blue-200/50">
                        <p className="text-blue-600 font-semibold text-sm mb-2">
                          Question {index + 1}
                        </p>
                        <p className="text-blue-800 leading-relaxed">{item.question}</p>
                      </div>
                    </div>
                  </div>
                  {/* User Answer */}
                  <div className="flex space-x-4 ml-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <User size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-2xl border border-indigo-200/50">
                        <p className="text-indigo-600 font-semibold text-sm mb-2">
                          Your Response
                        </p>
                        <p className="text-indigo-800 leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-8 flex items-start justify-center overflow-y-auto">
            {questionLoading ? (
              <div className="flex flex-col items-center justify-center space-y-6 min-h-[500px]">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-blue-700">Analyzing your response...</p>
                <p className="text-blue-500">Please wait while we prepare the next question</p>
              </div>
            ) : currentQuestion && (
              <div className="max-w-4xl w-full">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-blue-200/50 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
                  <div className="relative z-10 p-10">
                    <div className="flex items-center space-x-4 mb-8 h-16">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <MessageCircle size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-bold text-blue-800">
                          Question {chatHistory.length + 1}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Question Display */}
                    <div className="mb-8 h-32">
                      <div className="h-full p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 overflow-y-auto">
                        <p className="text-xl text-blue-800 leading-relaxed font-medium">
                          {currentQuestion}
                        </p>
                      </div> 
                    </div>
                    
                    {/* Answer Input Section */}
                    <div className="space-y-6">
                      <div className="relative">
                        <textarea
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          className="w-full h-40 bg-white/90 backdrop-blur-sm text-blue-800 p-6 rounded-2xl border border-blue-200/50 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 resize-none text-lg shadow-sm placeholder-blue-400"
                          placeholder="Type your answer here..."
                          aria-label="Answer input"
                          maxLength={5000}
                          disabled={questionLoading}
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-blue-400">
                          {answer.length}/5000
                        </div>
                      </div>
                      
                      {/* Error Display */}
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-4">
                        <button
                          onClick={handleNext}
                          disabled={!answer.trim() || questionLoading}
                          className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 ${
                            !answer.trim() || questionLoading
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                          }`}
                          aria-label="Submit answer"
                          title={
                            !answer.trim()
                              ? 'Please provide an answer first'
                              : questionLoading
                              ? 'Processing your previous answer'
                              : 'Submit answer (Ctrl+Enter)'
                          }
                        >
                          {questionLoading ? (
                            <>
                              <Loader2 size={20} className="animate-spin" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <span>Next</span>
                              <Send size={20} />
                            </>
                          )}
                        </button>
                      </div>
                      
                      {/* Keyboard Shortcuts Help */}
                      {!questionLoading && (
                        <div className="text-center text-blue-400 text-sm">
                          <p>
                            💡 Press <kbd className="bg-blue-100 px-2 py-1 rounded text-blue-700">Ctrl+Enter</kbd> to submit your answer
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeQuestionSession;