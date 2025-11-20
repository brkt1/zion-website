import { useEffect, useState } from 'react';
import { FaEnvelope, FaEye, FaEyeSlash, FaGraduationCap, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { hasAcceptedApplication, isElearningUser } from '../services/auth';
import { supabase } from '../services/supabase';

const ElearningLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in and has access
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const hasAccess = await isElearningUser();
        if (hasAccess) {
          navigate('/elearning');
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNeedsEmailConfirmation(false);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        // Check if error is due to email not confirmed
        // Supabase can return various error messages for unconfirmed emails
        const errorMessage = (loginError.message || '').toLowerCase();
        const errorStatus = loginError.status || (loginError as any).code;
        
        // Log error for debugging (remove in production if needed)
        console.log('Login error:', { message: loginError.message, status: errorStatus, error: loginError });
        
        const isEmailNotConfirmed = 
          errorMessage.includes('email not confirmed') ||
          errorMessage.includes('email not verified') ||
          errorMessage.includes('email_not_confirmed') ||
          errorMessage.includes('email_not_verified') ||
          errorMessage.includes('unconfirmed') ||
          (errorMessage.includes('confirm') && errorMessage.includes('email')) ||
          (errorMessage.includes('verify') && errorMessage.includes('email')) ||
          // Sometimes Supabase returns 400 with "Invalid login credentials" for unconfirmed emails
          (errorStatus === 400 && errorMessage.includes('invalid') && errorMessage.includes('login')) ||
          // Check error code if available
          (loginError as any).code === 'email_not_confirmed' ||
          (loginError as any).code === 'email_not_verified';
        
        if (isEmailNotConfirmed) {
          setNeedsEmailConfirmation(true);
          setError('Please confirm your email address before logging in. Check your inbox (and spam folder) for the confirmation link.');
          setLoading(false);
          return;
        }
        
        // For 400 errors, it might be an unconfirmed email even if message doesn't explicitly say so
        // Try to check if user exists by attempting to get user info
        if (errorStatus === 400) {
          // Check if we can determine it's an email confirmation issue
          // by trying to see if the error suggests the account exists
          const mightBeUnconfirmed = 
            errorMessage.includes('invalid') || 
            errorMessage.includes('credentials') ||
            errorMessage.includes('wrong');
          
          if (mightBeUnconfirmed) {
            // It could be unconfirmed email or wrong password
            // Show a more helpful message that covers both cases
            setNeedsEmailConfirmation(true);
            setError('Unable to login. This could be because: 1) Your email is not confirmed yet, or 2) Your password is incorrect. Please check your email for a confirmation link, or try resetting your password.');
            setLoading(false);
            return;
          }
        }
        
        // For other errors, show the actual error message
        setError(loginError.message || 'Failed to login. Please check your credentials.');
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check if email is confirmed
        if (!data.user.email_confirmed_at) {
          setNeedsEmailConfirmation(true);
          setError('Please confirm your email address before logging in. Check your inbox for the confirmation link.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Check if user has e-learning access
        const hasAccess = await isElearningUser();
        
        if (!hasAccess) {
          await supabase.auth.signOut();
          setError('You do not have access to e-learning. Please ensure your internship application has been accepted.');
          setLoading(false);
          return;
        }
        
        navigate('/elearning');
      }
    } catch (err: any) {
      // Check if this is an email confirmation error that wasn't caught earlier
      const errorMessage = err.message?.toLowerCase() || '';
      const isEmailNotConfirmed = 
        errorMessage.includes('email not confirmed') ||
        errorMessage.includes('email not verified') ||
        errorMessage.includes('email_not_confirmed') ||
        errorMessage.includes('email_not_verified') ||
        (errorMessage.includes('confirm') && errorMessage.includes('email'));
      
      if (isEmailNotConfirmed) {
        setNeedsEmailConfirmation(true);
        setError('Please confirm your email address before logging in. Check your inbox (and spam folder) for the confirmation link.');
      } else {
        setError(err.message || 'Failed to login. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      // First check if email has an accepted application
      const hasAccess = await hasAcceptedApplication(email);
      
      if (!hasAccess) {
        setError('You do not have access to e-learning. Please ensure your internship application has been accepted by an administrator.');
        setLoading(false);
        return;
      }

      // Sign up the user
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) throw signupError;

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.email_confirmed_at) {
          // Email already confirmed, redirect to e-learning
          navigate('/elearning');
        } else {
          // Email confirmation required
          setNeedsEmailConfirmation(true);
          setSuccess('Account created successfully! Please check your email to confirm your account before logging in.');
          setIsSignup(false);
          setPassword('');
          setConfirmPassword('');
          // Keep email in the field so user can resend if needed
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/elearning`,
        },
      });

      if (resendError) throw resendError;

      setSuccess('Confirmation email sent! Please check your inbox (and spam folder) for the confirmation link.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/elearning/login?reset=true`,
      });

      if (resetError) throw resetError;

      setSuccess('Password reset link sent! Please check your email to reset your password.');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <FaGraduationCap className="text-white text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">E-Learning Portal</h1>
            <p className="text-gray-600">
              {isSignup ? 'Create your account to access training materials' : 'Login to access your internship training materials'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {needsEmailConfirmation && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <FaEnvelope className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-blue-800 text-sm font-medium mb-2">Email Confirmation Required</p>
                  <p className="text-blue-700 text-xs mb-3">
                    We've sent a confirmation link to <strong>{email}</strong>. Please check your inbox and click the link to confirm your account.
                  </p>
                  <p className="text-blue-600 text-xs mb-3">
                    <strong>Didn't receive the email?</strong> Check your spam folder or click the button below to resend.
                  </p>
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendLoading || !email}
                    className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {resendLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaEnvelope className="mr-2" />
                        Resend Confirmation Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="resetEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Sending reset link...
                  </>
                ) : (
                  'Send Password Reset Link'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                  setSuccess('');
                  setEmail('');
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder={isSignup ? "Create a password (min. 6 characters)" : "Enter your password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    {isSignup ? 'Creating account...' : 'Logging in...'}
                  </>
                ) : (
                  isSignup ? 'Create Account' : 'Login to E-Learning'
                )}
              </button>
            </form>
          )}

          {!isForgotPassword && !isSignup && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {!isForgotPassword && (
            <div className="mt-6 text-center space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                  setSuccess('');
                  setNeedsEmailConfirmation(false);
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
              </button>
            {!isSignup && (
              <p className="text-xs text-gray-500">
                Only accepted internship applicants can access e-learning
              </p>
            )}
              {isSignup && (
                <p className="text-xs text-gray-500">
                  You must have an accepted internship application to create an account
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElearningLogin;

