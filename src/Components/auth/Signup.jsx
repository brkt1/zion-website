import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSignup = async (e) => {
        e.preventDefault();
        const { user, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            setError(error.message);
        } else {
            // Handle successful signup (e.g., redirect or update state)
            console.log('User signed up:', user);
        }
    };

    return (
        <div>
            <h2>Signup</h2>
            <form onSubmit={handleSignup}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Signup</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default Signup;
