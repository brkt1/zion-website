import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Ensure the correct path to supabaseClient
import QRScanner from './QRScanner'; // Import the QRScanner component

const CafeOwnerCheckWinner = () => {
  const [playerId, setPlayerId] = useState('');
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prizeDelivered, setPrizeDelivered] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleQRScan = async (scanData) => {
    setLoading(true);
    setError(null);
    try {
      setPlayerId(scanData);
      await checkCertificate(scanData);
    } catch (err) {
      setError('Error scanning QR code: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkCertificate = async (playerId) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('playerId', playerId)
        .single();

      if (error) throw error;

      setCertificateData(data);
    } catch (err) {
      setError('Error checking certificate: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmPrizeDelivery = async () => {
    if (!certificateData) {
      setError('No certificate data available.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{ playerId: certificateData.playerId, amount: certificateData.prize_amount }]);

      if (paymentError) throw paymentError;

      const { error: updateError } = await supabase
        .from('certificates')
        .update({ prize_delivered: true })
        .eq('playerId', certificateData.playerId);

      if (updateError) throw updateError;

      setPrizeDelivered(true);
      setCertificateData(null);
      setPlayerId('');
    } catch (err) {
      setError('Error confirming prize delivery: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Authenticate against the cafe_owners table
    const { data, error } = await supabase
      .from('cafe_owners')
      .select('*')
      .eq('email', email)
      .eq('password', password) // Ensure password is hashed in the database
      .single();

    if (error || !data) {
      setError('Login failed: ' + (error ? error.message : 'Invalid credentials'));
    } else {
      setIsLoggedIn(true);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Cafe Owner Dashboard</h1>

      {!isLoggedIn ? (
        <form onSubmit={handleLogin} className="mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 font-bold text-white ${loading ? 'bg-gray-500' : 'bg-purple-500 hover:bg-purple-600'} rounded-md shadow-md transition-all`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      ) : (
        <>
          {showScanner && (
            <QRScanner onScan={handleQRScan} />
          )}
          <button onClick={() => setShowScanner(!showScanner)} className="mt-4 w-full px-4 py-2 bg-purple-500 text-white rounded-md">
            {showScanner ? 'Hide Scanner' : 'Show Scanner'}
          </button>
          {prizeDelivered && <p className="mt-4 text-green-500">Prize delivered successfully!</p>}
          <button onClick={confirmPrizeDelivery} className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-md">
            Confirm Prize Delivery
          </button>
        </>
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
