import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

const generateRandomPassword = (length) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};

const AddCafeOwner = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login'); // Redirect to login if not authenticated
            }
        };
        checkUser();
    }, [navigate]);

    const handleAddCafeOwner = async (e) => {
        e.preventDefault();
        const password = generateRandomPassword(12); // Generate a random password of length 12
        const { data, error } = await supabase
            .from('cafe_owners')
            .insert([{ name, email, password }]); // Include generated password in the insert

        if (error) {
            setError('Error adding cafe owner: ' + error.message);
        } else {
            setName('');
            setEmail('');
            // Optionally, navigate or show a success message
        }
    };

    return (
        <div>
            <h2>Add Cafe Owner</h2>
            <form onSubmit={handleAddCafeOwner}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Add Cafe Owner</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default AddCafeOwner;