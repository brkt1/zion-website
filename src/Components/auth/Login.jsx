import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaSignInAlt, FaSpinner } from 'react-icons/fa';



const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Log in the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      const user = authData?.user;
      if (!user) {
        throw new Error('Authentication failed - no user returned');
      }

      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== '406') {
        throw profileError;
      }

      // Handle profile creation if needed
      if (!profileData) {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            role: 'user' // default role
          });

        if (upsertError) {
          console.warn('Failed to create profile:', upsertError);
        }
      }

      // Redirect based on role
      const role = profileData?.role || 'user';
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      
      if (error.code === '406') {
        setError('Profile system not properly configured. Contact support.');
      }
    } finally {
      setIsLoading(false);
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
            disabled={isLoading}
            className={`w-full py-3 rounded-lg transition-all duration-200 flex items-center justify-center
              ${isLoading 
                ? 'bg-gold-secondary/70 cursor-not-allowed' 
                : 'bg-gradient-to-r from-gold-primary to-gold-secondary hover:from-gold-primary/90 hover:to-gold-secondary/90'}
            `}
          >
            {isLoading ? (
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
          Don't have an account? please connect to the admin
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
