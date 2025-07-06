import React, { useState } from 'react';
import QRCode from 'qrcode';
import { supabase } from '../../supabaseClient';

interface CertificateProps {
  playerName: string;
  playerId: string;
  score: number;
  hasWonCoffee: boolean;
  hasWonPrize: boolean;
  gameType: 'trivia' | 'emoji';
  onError?: (error: Error) => void;
}

const CertificateGenerator: React.FC<CertificateProps> = ({
  playerName,
  playerId,
  score,
  hasWonCoffee,
  hasWonPrize,
  gameType,
  onError
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const saveCertificateProps = async (certificateProps: {
    playerName: string;
    playerId: string;
    score: number;
    hasWonCoffee: boolean;
    hasWonPrize: boolean;
    gameType: 'trivia' | 'emoji';
    timestamp: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .insert([certificateProps])
        .select();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    } catch (error) {
      console.error('Error saving certificate:', error);
      onError?.(error instanceof Error ? error : new Error('Saving failed'));
      throw error;
    }
  };

  const generateCertificate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      if (!playerName || !playerId) {
        throw new Error('Missing player information');
      }

      const certificateProps = {
        playerName,
        playerId,
        score,
        hasWonCoffee,
        hasWonPrize,
        gameType,
        timestamp: new Date().toISOString()
      };

      await saveCertificateProps(certificateProps);

      const canvas = document.createElement('canvas');
      const pixelRatio = window.devicePixelRatio || 1;
      const canvasWidth = 600;
      const canvasHeight = 800;

      canvas.width = canvasWidth * pixelRatio;
      canvas.height = canvasHeight * pixelRatio;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      const ctx = canvas.getContext('2d')!;
      ctx.scale(pixelRatio, pixelRatio);

      const theme = {
        background: '#000000',
        primary: '#FFD700',
        secondary: '#FFF3B1',
        accent: '#CCAC00',
        text: {
          light: '#FFFFFF',
          muted: '#AAAAAA'
        }
      };

      // Draw background
      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Load and draw logo
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(img);
          img.onerror = reject;
        });
      };

      try {
        const logo = await loadImage('/zionlogo.png');
        ctx.drawImage(logo, canvasWidth/2 - 50, 30, 100, 100);
      } catch (error) {
        console.error('Error loading logo:', error);
      }

      // Text rendering function
      const renderText = (
        text: string, 
        y: number, 
        options: { 
          size: number; 
          color: string; 
          weight?: string;
          align?: CanvasTextAlign 
        }
      ) => {
        const { size, color, weight = '400', align = 'center' } = options;
        ctx.font = `${weight} ${size}px Arial`;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.fillText(text, canvasWidth / 2, y);
      };

      // Decorative elements
      const drawDecorativeShapes = () => {
        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.lineTo(canvasWidth - 50, 50);
        ctx.lineTo(canvasWidth - 75, 75);
        ctx.lineTo(75, 75);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(50, 50, 20, 0, Math.PI * 2);
        ctx.arc(canvasWidth - 50, 50, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
        ctx.fill();
      };

      drawDecorativeShapes();

      // Certificate content
      const title = gameType === 'trivia' 
        ? '🏆 Trivia Champion' 
        : '🎮 Emoji Game Champion';
      
      renderText(title, 180, {
        size: 42,
        color: theme.primary,
        weight: '700'
      });

      renderText(`Congratulations, ${playerName}!`, 230, {
        size: 32,
        color: theme.text.light,
        weight: '500'
      });

      renderText(`Player ID: ${playerId}`, 280, {
        size: 24,
        color: theme.secondary
      });

      const prizeText = `Score: ${score} points ${hasWonCoffee ? '☕ Free Coffee' : ''} ${hasWonPrize ? '💰 1k Prize' : ''}`;
      renderText(prizeText.trim(), 330, {
        size: 36,
        weight: '600',
        color: theme.accent
      });

      // QR Code Generation
      try {
        const qrCanvas = document.createElement('canvas');
        const qrData = JSON.stringify(certificateProps);
        
        await QRCode.toCanvas(qrCanvas, qrData, {
          width: 200,
          errorCorrectionLevel: 'H',
          margin: 1
        });

        ctx.drawImage(
          qrCanvas,
          (canvasWidth - 200) / 2,
          400,
          200,
          200
        );
      } catch (qrError) {
        console.error('QR Code generation failed:', qrError);
        throw new Error('Failed to generate QR code');
      }

      // Footer text
      renderText('Official Digital Certificate', 650, {
        size: 20,
        color: theme.primary
      });

      renderText('Verified by Yenege', 690, {
        size: 16,
        color: 'rgba(255, 215, 0, 0.7)'
      });

      // Create download link
      const filename = `${gameType}_champion_${playerName.replace(/\s+/g, '_')}.png`;
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Certificate generation failed:", error);
      onError?.(error instanceof Error ? error : new Error('Generation failed'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateCertificate}
      disabled={isGenerating}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform ${
        isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
      }`}
    >
      {isGenerating ? 'Generating...' : 'Download Certificate'}
    </button>
  );
};

export default CertificateGenerator;