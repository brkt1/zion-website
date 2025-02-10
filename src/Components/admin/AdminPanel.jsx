import React, { useEffect, useState } from 'react';
import WinnerList from './WinnerList';
import { supabase } from '../../supabaseClient';
import AddCafeOwner from './AddCafeOwner';
import { useNavigate } from 'react-router-dom';
import CardGenerator from '../../payment/CardGenerator'; // Correcting the import path

const AdminPanel = () => {
    const [certificates, setCertificates] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login'); // Redirect to login if not authenticated
            } else {
                fetchCertificates();
            }
        };

        checkUser();
    }, [navigate]);

    const fetchCertificates = async () => {
        const { data, error } = await supabase
            .from('certificates')
            .select('*');

        if (error) {
            console.error('Error fetching certificates:', error);
        } else {
            setCertificates(data);
        }
    };

    const togglePaidStatus = async (id, currentStatus) => {
        const { error } = await supabase
            .from('certificates')
            .update({ paid: !currentStatus })
            .eq('id', id);

        if (error) {
            console.error('Error updating paid status:', error);
        } else {
            setCertificates(certificates.map(cert => 
                cert.id === id ? { ...cert, paid: !currentStatus } : cert
            ));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>
            
            <AddCafeOwner /> {/* Rendering the AddCafeOwner component */}

            <div className="mb-12"> 
                <CardGenerator /> {/* Adding the CardGenerator component */}
                <WinnerList />
            </div>
    
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Certificates</h2>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Player Name</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Game Type</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {certificates.map(cert => (
                            <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cert.playerName}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{cert.score}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{cert.gameType}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${cert.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {cert.paid ? 'Paid' : 'Unpaid'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => togglePaidStatus(cert.id, cert.paid)}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${cert.paid 
                                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                                            : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                    >
                                        {cert.paid ? 'Mark Unpaid' : 'Mark Paid'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>    
    );
};

export default AdminPanel;