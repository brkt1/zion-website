import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../utility/LoadingSpinner';

interface GameResultData {
  playerName: string;
  playerId: string;
  score: number;
  gameType: string;
  timestamp: string;
  // Add other relevant game details here
}

// Interface for the raw server response
interface ServerGameResult {
  player_name: string;
  player_id: string;
  score: number;
  game_type: string;
  timestamp: string;
  session_id: string;
  stage?: number;
  streak?: number;
}

const GameResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<GameResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      console.log("🎯 GameResult: Received location state:", location.state);
      const { sessionId, playerId, playerName, gameType, score, timestamp } = location.state || {};

      if (!sessionId || !playerId) {
        console.error("❌ GameResult: Missing required data:", { sessionId, playerId });
        setError('Missing session or player ID.');
        setIsLoading(false);
        return;
      }

      console.log("✅ GameResult: Required data present:", { sessionId, playerId, playerName, gameType, score, timestamp });

      try {
        // Try to fetch from API first
        const response = await fetch(`http://localhost:3001/api/scores/result?sessionId=${sessionId}&playerId=${playerId}`);
        
        if (response.ok) {
          const serverData: ServerGameResult = await response.json();
          console.log('Server response data:', serverData);
          
          // Map server data to component data structure
          const mappedData: GameResultData = {
            playerName: serverData.player_name || 'Unknown Player',
            playerId: serverData.player_id || 'Unknown ID',
            score: serverData.score || 0,
            gameType: serverData.game_type || 'Unknown Game',
            timestamp: serverData.timestamp || new Date().toISOString(),
          };
          
          console.log('Mapped data from API:', mappedData);
          setResult(mappedData);
        } else {
          // If API fails, use navigation state data as fallback
          console.log('API call failed, using navigation state data as fallback');
          const fallbackData: GameResultData = {
            playerName: playerName || 'Unknown Player',
            playerId: playerId || 'Unknown ID',
            score: score || 0,
            gameType: gameType || 'Unknown Game',
            timestamp: timestamp || new Date().toISOString(),
          };
          
          console.log('Fallback data from navigation state:', fallbackData);
          setResult(fallbackData);
        }
      } catch (err: any) {
        console.error('Error fetching game results:', err);
        
        // Use navigation state data as fallback if API completely fails
        console.log('Using navigation state data as fallback due to error');
        const fallbackData: GameResultData = {
          playerName: playerName || 'Unknown Player',
          playerId: playerId || 'Unknown ID',
          score: score || 0,
          gameType: gameType || 'Unknown Game',
          timestamp: timestamp || new Date().toISOString(),
        };
        
        console.log('Fallback data from navigation state:', fallbackData);
        setResult(fallbackData);
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
