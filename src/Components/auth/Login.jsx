import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';



const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/login-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            // Store role in session storage
            sessionStorage.setItem('userRole', data.role);

            
            // Redirect based on role
            const navigate = useNavigate();
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }


            
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    Welcome Back
                </h2>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        } transition-colors`}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}
                </form>

                <div className="mt-6 text-center">
                    <a 
                        href="#forgot-password" 
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Forgot Password?
                    </a>
                </div>

                <div className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? {' '}
                    <a 
                        href="#signup" 
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Create Account
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;
