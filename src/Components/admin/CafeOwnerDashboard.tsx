
import React, { useState, useEffect } from 'react';
import WinnerScanner from './WinnerScanner';
import RewardWinner from './RewardWinner';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../utility/LoadingSpinner';
import Error from '../utility/Error';

interface CafeOwnerDashboardData {
  cafeName: string;
  totalCardsScanned: number;
  activeGames: number;
  recentWinners: Array<{
    winnerId: string;
    playerName: string;
    gameType: string;
    reward: string;
    timestamp: string;
  }>;
  cardUsageStats: {
    used: number;
    available: number;
  };
}

const API_BASE_URL = 'http://localhost:3001/api';

const CafeOwnerDashboard = () => {
  const { session } = useAuthStore();
  const [winner, setWinner] = useState(null);
  const [dashboardData, setDashboardData] = useState<CafeOwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!session?.access_token) {
      setError('Authentication required.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/cafe-owner/dashboard`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }

      const data: CafeOwnerDashboardData = await response.json();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [session]); // Re-fetch if session changes

  const handleWinnerFound = (winnerData: any) => {
    setWinner(winnerData);
  };

  const handleRewardGiven = () => {
    setWinner(null);
    fetchDashboardData(); // Refresh dashboard data after rewarding a winner
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black-primary">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black-primary">
        <Error message={error} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-black-secondary rounded-lg shadow-md text-cream border border-gray-dark">
      <h1 className="text-3xl font-bold mb-6 text-center text-gold-primary">Cafe Owner Dashboard</h1>

      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black-primary p-4 rounded-lg shadow-inner border border-gray-medium">
            <h2 className="text-xl font-semibold text-gold-light mb-2">Cafe Overview</h2>
            <p><strong>Cafe Name:</strong> {dashboardData.cafeName}</p>
            <p><strong>Total Cards Scanned:</strong> {dashboardData.totalCardsScanned}</p>
            <p><strong>Active Games:</strong> {dashboardData.activeGames}</p>
          </div>

          <div className="bg-black-primary p-4 rounded-lg shadow-inner border border-gray-medium">
            <h2 className="text-xl font-semibold text-gold-light mb-2">Card Usage</h2>
            <p><strong>Used Cards:</strong> {dashboardData.cardUsageStats.used}</p>
            <p><strong>Available Cards:</strong> {dashboardData.cardUsageStats.available}</p>
            <p><strong>Total Cards:</strong> {dashboardData.cardUsageStats.used + dashboardData.cardUsageStats.available}</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gold-primary mb-4">Recent Winners</h2>
        {dashboardData?.recentWinners.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-black-primary rounded-lg overflow-hidden border border-gray-medium">
              <thead>
                <tr className="bg-gray-dark text-gold-light">
                  <th className="py-2 px-4 text-left">Player Name</th>
                  <th className="py-2 px-4 text-left">Game Type</th>
                  <th className="py-2 px-4 text-left">Reward</th>
                  <th className="py-2 px-4 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentWinners.map((winner, index) => (
                  <tr key={winner.winnerId} className={index % 2 === 0 ? 'bg-black-secondary' : 'bg-black-primary'}>
                    <td className="py-2 px-4">{winner.playerName}</td>
                    <td className="py-2 px-4">{winner.gameType}</td>
                    <td className="py-2 px-4">{winner.reward}</td>
                    <td className="py-2 px-4">{new Date(winner.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-light">No recent winners to display.</p>
        )}
      </div>

      <div className="mt-8 p-6 bg-black-primary rounded-lg shadow-inner border border-gray-medium">
        <h2 className="text-2xl font-bold text-gold-primary mb-4">Manage Winners</h2>
        {!winner ? (
          <WinnerScanner onWinnerFound={handleWinnerFound} />
        ) : (
          <RewardWinner winner={winner} onRewardGiven={handleRewardGiven} />
        )}
      </div>
    </div>
  );
};

export default CafeOwnerDashboard;
