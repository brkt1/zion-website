import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaSignInAlt, FaSpinner } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, error, loading, user, profile, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (user && profile) {
      // Redirect based on role after successful login and profile fetch
      if (profile.role === 'ADMIN') {
        navigate('/admin');
      } else if (profile.role === 'CAFE_OWNER') {
        navigate('/cafe-owner/dashboard');
      } else {
        navigate('/'); // Default redirect for regular users
      }
    }
  }, [user, profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (err) {
      // Error is already set in the store, no need to set local state
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black-primary to-black-secondary p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black-secondary rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-dark"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold-primary mb-2">Welcome Back</h1>
          <p className="text-gray-light">Sign in to your GameHub account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-medium" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full py-3 pl-10 pr-4 bg-black-primary text-cream rounded-lg border border-gray-dark focus:outline-none focus:ring-1 focus:ring-gold-primary"
              placeholder="Email address"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-medium" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full py-3 pl-10 pr-4 bg-black-primary text-cream rounded-lg border border-gray-dark focus:outline-none focus:ring-1 focus:ring-gold-primary"
              placeholder="Password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-lg transition-all duration-200 flex items-center justify-center
              ${loading 
                ? 'bg-gold-secondary/70 cursor-not-allowed' 
                : 'bg-gradient-to-r from-gold-primary to-gold-secondary hover:from-gold-primary/90 hover:to-gold-secondary/90'}
            `}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <FaSignInAlt className="mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-red-900/20 text-red-300 rounded-lg border-l-4 border-red-500"
          >
            {error}
          </motion.div>
        )}

        <div className="mt-6 text-center text-sm text-gray-light">
          Don&apos;t have an account? please connect to the admin
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
