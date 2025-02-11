import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

const WinnerList = () => {
    const [certificates, setCertificates] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
            } else {
                fetchCertificates();
            }
        };

        checkUser();
    }, [navigate]);

    const fetchCertificates = async () => {
        try {
            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCertificates(data);
        } catch (error) {
            setError('Error fetching certificates: ' + error.message);
        }
    };

    const formatBoolean = (value) => {
        return value ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Yes</span>
        ) : (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">No</span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Winner Certificates</h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coffee Won</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prize Won</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {certificates.map(cert => (
                                    <tr key={cert.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cert.playerName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.gameType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cert.score}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {formatBoolean(cert.hasWonCoffee)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {formatBoolean(cert.hasWonPrize)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {formatBoolean(cert.paid)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(cert.created_at).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                                {certificates.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                            No certificates found
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

export default WinnerList;