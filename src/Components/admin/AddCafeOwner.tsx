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

        const { data: existingOwner, error: existingOwnerError } = await supabase
            .from('cafe_owners')
            .select('email')
            .eq('email', email)
            .single();

        if (existingOwner) {
            setError('An account with this email already exists.');
            return;
        }
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
        <div className="min-h-screen bg-gray-900 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-6 border-b-2 border-amber-500 pb-2">
                    Cafe Owners Management
                </h1>

                {/* Add Owner Form */}
                <div className="bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 mb-6 border border-gray-700">
                    <h2 className="text-xl font-semibold text-amber-400 mb-4">Add New Cafe Owner</h2>
                    <form onSubmit={handleAddCafeOwner} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 bg-gray-700 border border-amber-500/30 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                placeholder="john@yenege.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-gray-700 border border-amber-500/30 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                required
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-amber-500 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                        >
                            Add Cafe Owner
                        </button>
                    </form>

                    {/* Status Messages */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-900/30 text-red-400 rounded-lg border border-red-700/50">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 p-3 bg-green-900/30 text-green-400 rounded-lg border border-green-700/50">
                            {success}
                        </div>
                    )}
                </div>

                {/* Existing Owners Table */}
                <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
                    <h2 className="text-xl font-semibold text-amber-400 p-4 sm:p-6 border-b border-gray-700">
                        Existing Cafe Owners
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-amber-400">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-amber-400">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-amber-400">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {existingOwners.map((owner) => (
                                    <tr key={owner.id} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-300">{owner.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400">{owner.email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400">
                                            {new Date(owner.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {existingOwners.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-4 py-6 text-center text-gray-500">
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
