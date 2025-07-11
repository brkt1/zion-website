
import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';


const RewardWinner = ({ winner, onRewardGiven }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReward = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = useAuthStore.getState().session?.access_token;
      if (!token) {
        setError('Authentication required to reward winner.');
        return;
      }

      const response = await fetch(`/api/winners/${winner.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prize_delivered: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reward winner via backend.');
      }

      onRewardGiven();
    } catch (err) {
      setError('Error rewarding winner: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Reward Winner</h2>
      <p>Winner: {winner.player_name}</p>
      <p>Prize: {winner.prize_amount}</p>
      <button
        onClick={handleReward}
        disabled={loading}
        className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-md"
      >
        {loading ? 'Rewarding...' : 'Confirm Reward'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default RewardWinner;
