import React from 'react';
const downloadQRCode = async () => {
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
    ctx.scale(pixelRatio, pixelRatio);

    const theme = {
      background: { start: '#1E3A8A', end: '#0F172A' },
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#6366F1',
      text: { light: '#F9FAFB', muted: '#D1D5DB' },
    };

    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, theme.background.start);
    gradient.addColorStop(1, theme.background.end);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const renderText = (text, y, options = {}) => {
      const { size = 24, color = theme.text.light, weight = '400', align = 'center' } = options;
      ctx.font = `${weight} ${size}px 'Inter', 'Helvetica Neue', sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.fillText(text, canvasWidth / 2, y);
    };

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
    renderText('🏆 Trivia Champion', 120, { size: 42, color: theme.primary, weight: '700' });
    renderText(`Congratulations, ${playerName}!`, 180, { size: 32, color: theme.text.light, weight: '500' });
    renderText(`Player ID: ${playerId}`, 230, { size: 24, color: theme.secondary });
    renderText(`Score: ${score} points`, 280, { size: 36, weight: '600', color: theme.accent });

    const qrCanvas = await generateQRCode({
      data: JSON.stringify({ playerName, playerId, score }),
      size: 250
    });

    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 20;
    ctx.drawImage(qrCanvas, (canvasWidth - 250) / 2, 350, 250, 250);
    ctx.shadowBlur = 0;

    renderText('Official Digital Certificate', 650, { size: 20, color: theme.text.muted });
    renderText('Verified by Zione', 690, { size: 16, color: 'rgba(255,255,255,0.5)' });

    const filename = `trivia_champion_${playerName.replace(/\s+/g, '_')}.png`;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
  } catch (error) {
    console.error('Error generating reward card:', error);
  }
};

const generateQRCode = (options) => {
  const { data, size = 200 } = options;
  return new Promise((resolve, reject) => {
    QRCodeGenerator.toCanvas(
      document.createElement('canvas'), 
      data, 
      { width: size, errorCorrectionLevel: 'M', margin: 1 }, 
      (error, canvas) => error ? reject(error) : resolve(canvas)
    );
  });
};

const RewardingCard = ({ playerName, score, hasWonCoffee, hasWonPrize }) => {
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
        onClick={downloadQRCode}
        className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-bold shadow-lg hover:shadow-xl transition-all"
      >
        Download Your Reward Card 🖼️
      </button>
    </div>
  );
};

export default RewardingCard;
