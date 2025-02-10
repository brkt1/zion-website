import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const AddCafeOwner = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase
            .from('cafe_owners')
            .insert([{ name, email, password }]);

        if (error) {
            setMessage('Error adding cafe owner: ' + error.message);
        } else {
            setMessage('Cafe owner added successfully!');
            setName('');
            setEmail('');
            setPassword('');
        }
    };

    return (
        <div>
            <h2>Add Cafe Owner</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Add Cafe Owner</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AddCafeOwner;
