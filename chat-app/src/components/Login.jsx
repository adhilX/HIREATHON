import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as loginAPI } from '../services/rocketchat';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginAPI(formData.username, formData.password);
      
      if (result.success) {
        login({
          authToken: result.authToken,
          userId: result.userId,
          user: result.user,
        });
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-500 to-purple-700 p-5">
      <div className="bg-white rounded-xl shadow-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-gray-800 mb-2 text-3xl font-semibold">
          Rocket.Chat Login
        </h1>
        <p className="text-gray-600 mb-8 text-sm">
          Connect to your local Rocket.Chat server
        </p>
        
        <form onSubmit={handleSubmit} className="text-left">
          <div className="mb-5">
            <label 
              htmlFor="username"
              className="block mb-1.5 text-gray-800 font-medium text-sm"
            >
              Username or Email
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your username or email"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          
          <div className="mb-5">
            <label 
              htmlFor="password"
              className="block mb-1.5 text-gray-800 font-medium text-sm"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-5 text-sm border border-red-200">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-br from-purple-500 to-purple-700 text-white border-none py-3.5 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 pt-5 border-t border-gray-200">
          <p className="text-gray-600 text-sm mb-3">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Sign up here
            </Link>
          </p>
          <p className="text-gray-600 text-xs m-0">
            Make sure your Rocket.Chat server is running on localhost:3000
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;