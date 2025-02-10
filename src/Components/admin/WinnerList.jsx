import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const WinnerList = () => {
    const [winners, setWinners] = useState([]);
    const [playerStats, setPlayerStats] = useState({
        totalPlayers: 0,
        totalPlayed: 0,
        totalDuration: 0,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [winnersRes, cardsRes] = await Promise.all([
                    supabase.from('winners').select('*'),
                    supabase.from('cards').select('*')
                ]);

                if (winnersRes.data) setWinners(winnersRes.data);
                if (cardsRes.data) {
                    setPlayerStats({
                        totalPlayers: cardsRes.data.length,
                        totalPlayed: cardsRes.data.filter(card => card.used).length,
                        totalDuration: cardsRes.data.reduce((acc, card) => acc + card.duration, 0)
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const filteredWinners = winners.filter(winner =>
        winner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        winner.prize.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedWinners = filteredWinners.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const chartData = {
        labels: ['Total Players', 'Active Players', 'Inactive Players'],
        datasets: [{
            label: 'Player Statistics',
            data: [
                playerStats.totalPlayers,
                playerStats.totalPlayed,
                playerStats.totalPlayers - playerStats.totalPlayed
            ],
            backgroundColor: [
                'rgba(54, 162, 235, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(255, 99, 132, 0.5)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
        }]
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-600">Total Players</h3>
                    <p className="mt-2 text-3xl font-bold text-blue-700">{playerStats.totalPlayers}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-600">Active Players</h3>
                    <p className="mt-2 text-3xl font-bold text-green-700">{playerStats.totalPlayed}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-600">Total Duration</h3>
                    <p className="mt-2 text-3xl font-bold text-purple-700">{playerStats.totalDuration}h</p>
                </div>
            </div>

            {/* Chart Section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Player Distribution</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
                </div>
            </div>

            {/* Winners Table */}
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Winners List</h2>
                <input
                    type="text"
                    placeholder="Search winners..."
                    className="px-4 py-2 border rounded-lg w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prize</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedWinners.map(winner => (
                            <tr key={winner.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">{winner.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">{winner.prize}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(winner.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="text-red-600 hover:text-red-800">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    Showing {paginatedWinners.length} of {filteredWinners.length} results
                </div>
                <div className="space-x-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage * itemsPerPage >= filteredWinners.length}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WinnerList;