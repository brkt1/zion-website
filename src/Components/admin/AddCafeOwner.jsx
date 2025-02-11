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
    const [success, setSuccess] = useState(null);
    const [existingOwners, setExistingOwners] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
            } else {
                fetchCafeOwners();
            }
        };
        checkUser();
    }, [navigate]);

    const fetchCafeOwners = async () => {
        try {
            const { data, error } = await supabase
                .from('cafe_owners')
                .select('id, name, email, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setExistingOwners(data);
        } catch (error) {
            setError('Error fetching cafe owners: ' + error.message);
        }
    };

    const handleAddCafeOwner = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        
        const password = generateRandomPassword(12);
        try {
            const { data, error } = await supabase
                .from('cafe_owners')
                .insert([{ name, email, password }]);

            if (error) throw error;
            
            setName('');
            setEmail('');
            setSuccess('Cafe owner added successfully!');
            fetchCafeOwners();
        } catch (error) {
            setError('Error adding cafe owner: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Cafe Owners Management</h1>

                {/* Add Owner Form */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Cafe Owner</h2>
                    <form onSubmit={handleAddCafeOwner} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="text-sm text-gray-500">
                            Password: {(() => {
                                const password = generateRandomPassword(12);
                                // Send the generated password to the backend
                                supabase
                                    .from('cafe_owners')
                                    .update({ password })
                                    .eq('email', email)
                                    .then(({ error }) => {
                                        if (error) console.error('Error updating password:', error);
                                    });
                                return password;
                            })()}
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Add Cafe Owner
                        </button>
                    </form>

                    {/* Status Messages */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                            {success}
                        </div>
                    )}
                </div>

                {/* Existing Owners Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <h2 className="text-xl font-semibold text-gray-700 p-6 border-b">Existing Cafe Owners</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {existingOwners.map((owner) => (
                                    <tr key={owner.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{owner.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{owner.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(owner.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {existingOwners.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                            No cafe owners found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCafeOwner;