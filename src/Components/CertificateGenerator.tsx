import React from 'react';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rpaxjodkgxfgneflavnj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwYXhqb2RrZ3hmZ25lZmxhdm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NDQyMzcsImV4cCI6MjA0NzQyMDIzN30.GSzz1RA75KCX3NiGfz2LOIAuXMPFYQy-fjXYH1S93cc'; // Replace with your actual Supabase anon key
const supabase = createClient(supabaseUrl, supabaseKey);


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
  const saveCertificateProps = async (certificateProps: {
    playerName: string;
    playerId: string;
    score: number;
    hasWonCoffee: boolean;
    hasWonPrize: boolean;
    gameType: 'trivia' | 'emoji';
  }) => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .insert([certificateProps]);
      if (error) throw error;
      console.log('Certificate saved:', data);
    } catch (error) {
      console.error('Error saving certificate:', error);
      onError?.(error as Error);
    }
  };

  const generateCertificate = async () => {
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

      const ctx = canvas.getContext('2d')!;
      ctx.scale(pixelRatio, pixelRatio);

      const theme = {
        background: {
          start: '#1E3A8A',
          end: '#0F172A'
        },
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#6366F1',
        text: {
          light: '#F9FAFB',
          muted: '#D1D5DB'
        }
      };

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, theme.background.start);
      gradient.addColorStop(1, theme.background.end);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Text rendering utility
      const renderText = (text: string, y: number, options: {
        size?: number;
        color?: string;
        weight?: string;
        align?: CanvasTextAlign
      } = {}) => {
        const {
          size = 24,
          color = theme.text.light,
          weight = '400',
          align = 'center'
        } = options;

        ctx.font = `${weight} ${size}px 'Inter', 'Helvetica Neue', sans-serif`;
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

      // Certificate content
      const title = gameType === 'trivia' ? '🏆 Trivia Champion' : '🎮 Emoji Game Champion';
      renderText(title, 120, {
        size: 42,
        color: theme.primary,
        weight: '700'
      });

      renderText(`Congratulations, ${playerName}!`, 180, {
        size: 32,
        color: theme.text.light,
        weight: '500'
      });

      renderText(`Player ID: ${playerId}`, 230, {
        size: 24,
        color: theme.secondary
      });

      const prizeText = `Score: ${score} points ${hasWonCoffee ? '☕ Free Coffee' : ''} ${hasWonPrize ? '💰 1k Prize' : ''}`;
      renderText(prizeText.trim(), 280, {
        size: 36,
        weight: '600',
        color: theme.accent
      });

      // QR Code
      const qrCanvas = document.createElement('canvas');
      const qrData = {
        playerName,
        playerId,
        score,
        hasWonCoffee,
        hasWonPrize,
        gameType,
        timestamp: new Date().toISOString()
      };

      await QRCode.toCanvas(qrCanvas, JSON.stringify(qrData), {
        width: 250,
        errorCorrectionLevel: 'M',
        margin: 1
      });

      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 20;
      ctx.drawImage(
        qrCanvas,
        (canvasWidth - 250) / 2,
        350,
        250,
        250
      );
      ctx.shadowBlur = 0;

      // Footer
      renderText('Official Digital Certificate', 650, {
        size: 20,
        color: theme.text.muted
      });

      renderText('Verified by Zione', 690, {
        size: 16,
        color: 'rgba(255,255,255,0.5)'
      });

      // Download
      const filename = `${gameType}_champion_${playerName.replace(/\s+/g, '_')}.png`;

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = filename;
      link.click();

    } catch (error) {
      console.error("Error generating certificate:", error);
      onError?.(error as Error);
    }
  };

  return (
    <button
      onClick={generateCertificate}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
    >
      Download Certificate
    </button>
  );
};

export default CertificateGenerator;
