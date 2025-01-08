import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Ensure you have Supabase client initialized
import QRCode from 'qrcode';

const downloadQRCode = async (playerName: string, playerId: string, score: number) => {
  try {
    if (!playerName || !playerId) {
      throw new Error('Missing player information');
    }

    const canvas = document.createElement('canvas');
    const pixelRatio = window.devicePixelRatio || 1;
    const canvasWidth = 600;
    const canvasHeight = 800;

    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context is not available');

    ctx.scale(pixelRatio, pixelRatio);

    // Define theme for the card
    const theme = {
      background: { start: '#1E3A8A', end: '#0F172A' },
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#6366F1',
      text: { light: '#F9FAFB', muted: '#D1D5DB' },
    };

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, theme.background.start);
    gradient.addColorStop(1, theme.background.end);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Function to render text
    const renderText = (text: string, y: number, options = {}) => {
      const { size = 24, color = theme.text.light, weight = '400', align = 'center' } = options as any;
      ctx.font = `${weight} ${size}px 'Inter', 'Helvetica Neue', sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.fillText(text, canvasWidth / 2, y);
    };

    // Add decorative shapes
    const drawDecorativeShapes = () => {
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.lineTo(canvasWidth - 50, 50);
      ctx.lineTo(canvasWidth - 75, 75);
      ctx.lineTo(75, 75);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(50, 50, 20, 0, Math.PI * 2);
      ctx.arc(canvasWidth - 50, 50, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fill();
    };

    drawDecorativeShapes();

    // Render main content
    renderText('🏆 Trivia Champion', 120, { size: 42, color: theme.primary, weight: '700' });
    renderText(`Congratulations, ${playerName}!`, 180, { size: 32, color: theme.text.light, weight: '500' });
    renderText(`Player ID: ${playerId}`, 230, { size: 24, color: theme.secondary });
    renderText(`Score: ${score} points`, 280, { size: 36, weight: '600', color: theme.accent });

    // Generate QR code for the reward
    const qrCodeData = await QRCode.toDataURL(`REWARD-${Date.now()}-${playerId}`);
    const qrImage = new Image();
    qrImage.src = qrCodeData;

    qrImage.onload = () => {
      ctx.drawImage(qrImage, (canvasWidth - 250) / 2, 350, 250, 250);

      // Render footer text
      renderText('Official Digital Certificate', 650, { size: 20, color: theme.text.muted });
      renderText('Verified by Zione', 690, { size: 16, color: 'rgba(255,255,255,0.5)' });

      // Download the canvas as an image
      const filename = `trivia_champion_${playerName.replace(/\s+/g, '_')}.png`;
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = filename;
      link.click();
    };

// Remove the unused generateQRCode function
    // Download the canvas as an image
    const filename = `trivia_champion_${playerName.replace(/\s+/g, '_')}.png`;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
  } catch (error) {
    console.error('Error generating reward card:', error);
  }
};

const generateQRCode = (options: { data: string; size?: number }) => {
  const { data, size = 200 } = options;
};

interface RewardingCardProps {
  playerName: string;
  playerId: string;
  score: number;
  hasWonCoffee: boolean;
  hasWonPrize: boolean;
  workerId: string; // ID of the worker issuing the reward
}

const RewardingCard: React.FC<RewardingCardProps> = ({ playerName, playerId, score, hasWonCoffee, hasWonPrize, workerId }) => {
  const [rewardStatus, setRewardStatus] = useState<string | null>(null);

  const checkAndSaveReward = async () => {
    try {
      // Check if the player has already won (by checking if reward exists)
      const { data, error } = await supabase
        .from('rewards')
        .select('id')
        .eq('player_id', playerId)
        .eq('status', 'unclaimed')
        .single(); // Check for existing unclaimed reward

      if (data) {
        setRewardStatus('This player has already claimed their reward.');
        return; // If already claimed, don't process again
      }

      // If the player hasn't claimed a reward, create a new one
      const rewardCode = `REWARD-${Date.now()}-${playerId}`;
      const rewardDetails = `Reward for scoring ${score} points`;

      const { error: insertError } = await supabase
        .from('rewards')
        .insert([
          {
            player_id: playerId,
            reward_code: rewardCode,
            reward_details: rewardDetails,
            status: 'unclaimed',
            issued_by: workerId, // Store the worker's ID who issued the reward
          },
        ]);

      if (insertError) {
        setRewardStatus('Error saving the reward.');
        console.error('Insert Error:', insertError);
      } else {
        setRewardStatus('Reward has been successfully claimed!');
        downloadQRCode(playerName, playerId, score); // Proceed with QR code download
      }
    } catch (error) {
      setRewardStatus('An error occurred while processing the reward.');
      console.error('Error:', error);
    }
  };
  return (
    <div className="w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 text-center text-white">
      <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
        🎉 Rewards Earned 🎉
      </h2>
      <p className="text-xl mb-2">Player: {playerName}</p>
      <p className="text-xl mb-2">Score: {score}</p>
      {hasWonCoffee && <p className="text-lg text-green-400">☕ You've earned a Coffee Reward!</p>}
      {hasWonPrize && <p className="text-lg text-yellow-400">🏆 You've won the Grand Prize!</p>}
      <button
        onClick={checkAndSaveReward}
        className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-bold shadow-lg hover:shadow-xl transition-all"
      >
        Claim Your Reward 🏆
      </button>
      {rewardStatus && <p className="mt-4">{rewardStatus}</p>}
    </div>
  );
};

export default RewardingCard;



