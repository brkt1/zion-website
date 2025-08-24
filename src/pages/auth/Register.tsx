import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGoogle, FaGamepad, FaArrowLeft, FaUsers, FaTrophy, FaQrcode } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Register: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/';

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Sign up error:', error);
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: FaQrcode,
      title: 'QR Code Gaming',
      description: 'Scan QR codes to access games instantly at any café'
    },
    {
      icon: FaUsers,
      title: 'Multiplayer Mode',
      description: 'Create or join game rooms to play with friends'
    },
    {
      icon: FaTrophy,
      title: 'Global Leaderboards',
      description: 'Compete on weekly, monthly, and global leaderboards'
    }
  ];

  return (
    <div className="min-h-screen bg-black-primary flex items-center justify-center p-6">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold-primary filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gold-secondary filter blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-2xl flex items-center justify-center mr-4">
                  <FaGamepad className="text-black-primary text-3xl" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-primary to-gold-secondary bg-clip-text text-transparent">
                    Yenege
                  </h1>
                  <p className="text-lg text-gray-light">Game App</p>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                Join the Gaming Revolution
              </h2>
              <p className="text-xl text-gray-light">
                Experience the future of social gaming with QR code access, 
                multiplayer modes, and a comprehensive reward system.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="text-black-primary text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-light">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 grid grid-cols-3 gap-6"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-primary">1000+</div>
                <div className="text-sm text-gray-light">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-primary">50+</div>
                <div className="text-sm text-gray-light">Partner Cafés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-primary">4</div>
                <div className="text-sm text-gray-light">Game Types</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center"
          >
            <div className="w-full max-w-md">
              {/* Header for Mobile */}
              <div className="text-center mb-8 lg:hidden">
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
                  Create Your Account
                </h2>
                <p className="text-gray-light">
                  Join thousands of players already enjoying the Yenege experience
                </p>
              </div>

              {/* Registration Form */}
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

                {/* Google Sign Up Button */}
                <button
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  className="w-full bg-white text-gray-900 font-medium py-4 px-6 rounded-xl hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaGoogle className="text-xl" />
                  )}
                  <span>
                    {isLoading ? 'Creating Account...' : 'Sign up with Google'}
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

                {/* Benefits */}
                <div className="mt-8 p-4 bg-gray-dark/50 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">What you get:</h4>
                  <ul className="space-y-2 text-sm text-gray-light">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-gold-primary rounded-full mr-3"></div>
                      Instant access to all games
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-gold-primary rounded-full mr-3"></div>
                      Earn points and rewards
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-gold-primary rounded-full mr-3"></div>
                      Compete on leaderboards
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-gold-primary rounded-full mr-3"></div>
                      Join multiplayer rooms
                    </li>
                  </ul>
                </div>

                {/* Info Text */}
                <div className="mt-6 text-center">
                  <p className="text-gray-light text-sm">
                    By creating an account, you agree to our{' '}
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
                  Already have an account?{' '}
                  <Link to="/login" className="text-gold-primary hover:underline font-medium">
                    Sign in here
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
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
