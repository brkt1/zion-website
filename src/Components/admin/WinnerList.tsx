import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

const ITEMS_PER_PAGE = 10;

const WinnerList = () => {
    const [certificates, setCertificates] = useState([]);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const token = useAuthStore.getState().session?.access_token;
            if (!token) {
                setError('Authentication required to fetch winners.');
                return;
            }

            const response = await fetch('/api/winners', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch winners from backend.');
            }

            const data = await response.json();
            setCertificates(data);
        } catch (error) {
            setError('Error fetching certificates: ' + error.message);
        }
    };

    const formatBoolean = (value) => {
        return value ? (
            <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">Yes</span>
        ) : (
            <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded-full text-xs">No</span>
        );
    };

    const totalPages = Math.ceil(certificates.length / ITEMS_PER_PAGE);
    const paginatedCertificates = certificates.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-amber-400 mb-6">Winner Certificates</h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-900/30 text-red-400 rounded-md">
                        {error}
                    </div>
                )}

                <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider">Player Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider">Game Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider">Score</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider">Coffee Won</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider">Prize Won</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider">Paid</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {paginatedCertificates.map(cert => (
                                    <tr key={cert.id} className="hover:bg-gray-700 transition-colors">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-300">{cert.playerName}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{cert.gameType}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{cert.score}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            {formatBoolean(cert.hasWonCoffee)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            {formatBoolean(cert.hasWonPrize)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            {formatBoolean(cert.paid)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
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
                                        <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                                            No certificates found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 0}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page >= totalPages - 1}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-400">
                                    Showing <span className="font-medium">{page * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min((page + 1) * ITEMS_PER_PAGE, certificates.length)}</span> of <span className="font-medium">{certificates.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 0}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page >= totalPages - 1}
                                        className="-ml-px relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WinnerList;
