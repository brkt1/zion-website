import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import QRScanner from './QRScanner';
import { FaQrcode, FaIdCard } from 'react-icons/fa';

const CafeOwnerCheckWinner = () => {
  const [playerId, setPlayerId] = useState('');
  const [winnerData, setWinnerData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prizeDelivered, setPrizeDelivered] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleQRScan = async (scanData) => {
    try {
      setLoading(true);
      setError(null);
      setWinnerData(null);

      const { playerId: scannedId } = scanData;

      // Check if the user is in the winners table using playerId
      const { data, error } = await supabase
        .from('winners')
        .select('*')
        .eq('player_id', scannedId)
        .single();

      if (error) throw error;

      if (!data) {
        setError('No winner found with this QR code.');
        return;
      }

      setWinnerData(data);
      setPrizeDelivered(data.prize_delivered);
      setPlayerId(scannedId);
      setShowScanner(false);
    } catch (err) {
      setError('Error checking winner: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkWinner = async () => {
    if (!playerId) {
      setError('Please enter a player ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setWinnerData(null);

    try {
      const { data, error } = await supabase
        .from('winners')
        .select('*')
        .eq('player_id', playerId)
        .single();

      if (error) throw error;

      if (!data) {
        setError('No winner found with this ID.');
        return;
      }

      setWinnerData(data);
      setPrizeDelivered(data.prize_delivered);
    } catch (err) {
      setError('Error checking winner: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmPrizeDelivery = async () => {
    if (!winnerData) {
      setError('No winner data available.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('winners')
        .update({ prize_delivered: true })
        .eq('player_id', winnerData.player_id);

      if (updateError) throw updateError;

      setPrizeDelivered(true);
      setWinnerData(null);
      setPlayerId('');
    } catch (err) {
      setError('Error confirming prize delivery: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Cafe Owner Dashboard</h1>

      {/* Toggle between QR Scanner and ID Input */}
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setShowScanner(false)}
          className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
            !showScanner ? 'bg-purple-500 text-white' : 'bg-gray-200'
          }`}
        >
          <FaIdCard />
          <span>Enter ID</span>
        </button>
        <button
          onClick={() => setShowScanner(true)}
          className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
            showScanner ? 'bg-purple-500 text-white' : 'bg-gray-200'
          }`}
        >
          <FaQrcode />
          <span>Scan QR</span>
        </button>
      </div>

      {showScanner ? (
        <div className="mb-4">
          <QRScanner onScanSuccess={handleQRScan} />
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Player ID
            </label>
            <input
              type="text"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter player ID"
            />
          </div>

          <button
            onClick={checkWinner}
            disabled={loading}
            className={`w-full px-4 py-2 font-bold text-white ${
              loading ? 'bg-gray-500' : 'bg-purple-500 hover:bg-purple-600'
            } rounded-md shadow-md transition-all`}
          >
            {loading ? 'Checking...' : 'Check Winner'}
          </button>
        </>
      )}

      {/* Display Winner Data */}
      {winnerData && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold">Winner Details</h2>
          <p><strong>Name:</strong> {winnerData.player_name}</p>
          <p><strong>ID:</strong> {winnerData.player_id}</p>
          <p><strong>Game Type:</strong> {winnerData.game_type}</p>
          <p><strong>Score:</strong> {winnerData.score}</p>
          <p><strong>Won Coffee:</strong> {winnerData.won_coffee ? 'Yes' : 'No'}</p>
          <p><strong>Won Prize:</strong> {winnerData.won_prize ? 'Yes' : 'No'}</p>
          <p><strong>Prize Delivered:</strong> {winnerData.prize_delivered ? 'Yes' : 'No'}</p>

          {!winnerData.prize_delivered && (
            <button
              onClick={confirmPrizeDelivery}
              disabled={loading}
              className="w-full mt-2 px-4 py-2 font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-md transition-all"
            >
              Confirm Prize Delivery
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  );
};

export default CafeOwnerCheckWinner;
