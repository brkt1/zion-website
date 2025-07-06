
import React, { useState } from 'react';
import WinnerScanner from './WinnerScanner';
import RewardWinner from './RewardWinner';

const CafeOwnerDashboard = () => {
  const [winner, setWinner] = useState(null);

  const handleWinnerFound = (winnerData) => {
    setWinner(winnerData);
  };

  const handleRewardGiven = () => {
    setWinner(null);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Cafe Owner Dashboard</h1>
      {!winner ? (
        <WinnerScanner onWinnerFound={handleWinnerFound} />
      ) : (
        <RewardWinner winner={winner} onRewardGiven={handleRewardGiven} />
      )}
    </div>
  );
};

export default CafeOwnerDashboard;
