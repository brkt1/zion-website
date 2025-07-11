import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LoadingSpinner from '../utility/LoadingSpinner';

interface GameResultData {
  playerName: string;
  playerId: string;
  score: number;
  gameType: string;
  timestamp: string;
  // Add other relevant game details here
}

const GameResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<GameResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      const { sessionId, playerId } = location.state || {};

      if (!sessionId || !playerId) {
        setError('Missing session or player ID.');
        setIsLoading(false);
        return;
      }

      try {
        // This endpoint needs to be created on the backend to fetch results for a session/player
        const response = await fetch(`http://localhost:3001/api/scores/result?sessionId=${sessionId}&playerId=${playerId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch game results.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [location.state]);

  const handleDownloadRecord = async () => {
    if (!result) return;

    const input = document.getElementById('game-result-card');
    if (input) {
      setIsLoading(true);
      try {
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`game_record_${result.playerId}.pdf`);
      } catch (err) {
        console.error('Error generating PDF:', err);
        alert('Failed to download record.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  }

  if (!result) {
    return <div className="text-center text-gray-400 mt-8">No game results found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-primary to-black-secondary text-cream flex items-center justify-center p-4">
      <div id="game-result-card" className="w-full max-w-md bg-black-secondary rounded-2xl shadow-2xl overflow-hidden border border-gold-primary/20 p-6 text-center">
        <h1 className="text-3xl font-bold text-gold-primary mb-4">Game Result</h1>
        <p className="text-lg mb-2"><span className="font-semibold">Player Name:</span> {result.playerName}</p>
        <p className="text-lg mb-2"><span className="font-semibold">Player ID:</span> {result.playerId}</p>
        <p className="text-lg mb-2"><span className="font-semibold">Game Type:</span> {result.gameType}</p>
        <p className="text-lg mb-4"><span className="font-semibold">Score:</span> {result.score}</p>
        <p className="text-sm text-gray-400">Played on: {new Date(result.timestamp).toLocaleString()}</p>

        <button
          onClick={handleDownloadRecord}
          className="mt-6 w-full py-3 px-4 bg-gold-primary hover:bg-gold-secondary text-black-primary rounded-lg font-bold transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Downloading...' : 'Download Record'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-cream rounded-lg font-bold transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default GameResult;
