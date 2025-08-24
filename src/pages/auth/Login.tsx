import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { FaArrowLeft, FaGamepad, FaGoogle } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/';

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black-primary flex items-center justify-center p-6">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold-primary filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gold-secondary filter blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-2xl flex items-center justify-center mr-4">
              <FaGamepad className="text-black-primary text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gold-primary to-gold-secondary bg-clip-text text-transparent">
                Yenege
              </h1>
              <p className="text-sm text-gray-light">Game App</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-light">
            Sign in to continue your gaming journey
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-black-secondary rounded-2xl p-8 border border-gray-dark"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white text-gray-900 font-medium py-4 px-6 rounded-xl hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaGoogle className="text-xl" />
            )}
            <span>
              {isLoading ? 'Signing In...' : 'Continue with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 h-px bg-gray-dark"></div>
            <span className="px-4 text-gray-light text-sm">or</span>
            <div className="flex-1 h-px bg-gray-dark"></div>
          </div>

          {/* Alternative Options */}
          <div className="space-y-4">
            <button
              disabled
              className="w-full bg-gray-dark text-gray-light font-medium py-4 px-6 rounded-xl opacity-50 cursor-not-allowed"
            >
              Email & Password (Coming Soon)
            </button>
            
            <button
              disabled
              className="w-full bg-gray-dark text-gray-light font-medium py-4 px-6 rounded-xl opacity-50 cursor-not-allowed"
            >
              Phone Number (Coming Soon)
            </button>
          </div>

          {/* Info Text */}
          <div className="mt-6 text-center">
            <p className="text-gray-light text-sm">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-gold-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-gold-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-gray-light">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-primary hover:underline font-medium">
              Sign up here
            </Link>
          </p>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-6"
        >
          <Link
            to="/"
            className="inline-flex items-center text-gray-light hover:text-white transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
