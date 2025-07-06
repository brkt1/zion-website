import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface WinnerData {
  playerId: string;
  playerName: string;
  gameType: string;
  score: number;
  prize: string;
  timestamp: string;
  sessionId: string;
}

interface WinnerCardGeneratorProps {
  winnerData: WinnerData;
  onCardGenerated?: (cardData: any) => void;
}

const WinnerCardGenerator: React.FC<WinnerCardGeneratorProps> = ({ 
  winnerData, 
  onCardGenerated 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<any>(null);
  const [qrCodeData, setQrCodeData] = useState<string>('');

  // Generate unique winner card ID
  const generateWinnerCardId = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `WIN-${timestamp}-${random}`;
  };

  // Generate winner card data
  const generateWinnerCard = async () => {
    setIsGenerating(true);
    
    try {
      const winnerCardId = generateWinnerCardId();
      
      const cardData = {
        winnerCardId,
        playerId: winnerData.playerId,
        playerName: winnerData.playerName,
        gameType: winnerData.gameType,
        score: winnerData.score,
        prize: winnerData.prize,
        timestamp: winnerData.timestamp,
        sessionId: winnerData.sessionId,
        status: 'unclaimed',
        generatedAt: new Date().toISOString()
      };

      // Save winner card to database
      const { data, error } = await supabase
        .from('winner_cards')
        .insert([cardData])
        .select()
        .single();

      if (error) throw error;

      // Generate QR code data
      const qrData = JSON.stringify({
        type: 'winner_card',
        winnerCardId,
        playerId: winnerData.playerId,
        prize: winnerData.prize,
        verificationCode: winnerCardId
      });

      setQrCodeData(qrData);
      setGeneratedCard(data);
      
      if (onCardGenerated) {
        onCardGenerated(data);
      }
    } catch (error) {
      console.error('Error generating winner card:', error);
      alert('Failed to generate winner card: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Create winner card PDF
  const createWinnerCardPDF = async () => {
    if (!generatedCard || !qrCodeData) {
      alert('No winner card data available');
      return;
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [85, 54] // Credit card size
    });

    // Create card container
    const container = document.createElement('div');
    container.style.cssText = `
      width: 320px;
      height: 200px;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6347 100%);
      border-radius: 15px;
      padding: 20px;
      color: #1a1a1a;
      font-family: 'Arial', sans-serif;
      position: relative;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    `;

    // Header
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = `
      text-align: center;
      margin-bottom: 10px;
    `;
    headerDiv.innerHTML = `
      <h2 style="margin: 0; font-size: 16px; font-weight: bold; color: #8B0000;">🏆 WINNER CARD 🏆</h2>
      <p style="margin: 2px 0; font-size: 10px; opacity: 0.8;">YENEGE GAMING PLATFORM</p>
    `;

    // Content area
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex: 1;
    `;

    // Player info
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
      flex: 1;
      font-size: 10px;
      line-height: 1.3;
    `;
    infoDiv.innerHTML = `
      <p style="margin: 2px 0; font-weight: bold;">Player: ${winnerData.playerName}</p>
      <p style="margin: 2px 0;">ID: ${winnerData.playerId}</p>
      <p style="margin: 2px 0;">Game: ${winnerData.gameType}</p>
      <p style="margin: 2px 0;">Score: ${winnerData.score}</p>
      <p style="margin: 2px 0; font-weight: bold; color: #8B0000;">Prize: ${winnerData.prize}</p>
    `;

    // QR Code
    const qrContainer = document.createElement('div');
    qrContainer.style.cssText = `
      margin-left: 10px;
    `;

    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;

    await new Promise<void>((resolve) => {
      QRCode.toCanvas(canvas, qrCodeData, {
        width: 80,
        color: {
          dark: "#8B0000",
          light: "#FFFFFF"
        },
        margin: 1
      }, (error) => {
        if (error) console.error('QR Code generation error:', error);
        resolve();
      });
    });

    qrContainer.appendChild(canvas);

    // Footer
    const footerDiv = document.createElement('div');
    footerDiv.style.cssText = `
      text-align: center;
      border-top: 1px solid rgba(139, 0, 0, 0.3);
      padding-top: 5px;
      font-size: 8px;
      opacity: 0.8;
    `;
    footerDiv.innerHTML = `
      <p style="margin: 0;">Scan to Claim Prize</p>
      <p style="margin: 2px 0 0 0;">Card ID: ${generatedCard.winnerCardId}</p>
    `;

    // Assemble card
    contentDiv.appendChild(infoDiv);
    contentDiv.appendChild(qrContainer);
    
    container.appendChild(headerDiv);
    container.appendChild(contentDiv);
    container.appendChild(footerDiv);

    // Add to document temporarily
    document.body.appendChild(container);

    try {
      // Convert to PDF
      const canvasElement = await html2canvas(container, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Remove container
      document.body.removeChild(container);

      // Add to PDF
      const imgData = canvasElement.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`winner_card_${winnerData.playerName}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error creating PDF:', error);
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  };

  // Download winner card as image
  const downloadWinnerCardImage = async () => {
    if (!generatedCard || !qrCodeData) {
      alert('No winner card data available');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 500;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.5, '#FFA500');
    gradient.addColorStop(1, '#FF6347');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add border
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Add text
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 WINNER CARD 🏆', canvas.width / 2, 80);

    ctx.font = '20px Arial';
    ctx.fillText('YENEGE GAMING PLATFORM', canvas.width / 2, 110);

    // Player information
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1a1a1a';
    
    const leftX = 50;
    let currentY = 180;
    const lineHeight = 35;

    ctx.fillText(`Player: ${winnerData.playerName}`, leftX, currentY);
    currentY += lineHeight;
    ctx.fillText(`Player ID: ${winnerData.playerId}`, leftX, currentY);
    currentY += lineHeight;
    ctx.fillText(`Game: ${winnerData.gameType}`, leftX, currentY);
    currentY += lineHeight;
    ctx.fillText(`Score: ${winnerData.score}`, leftX, currentY);
    currentY += lineHeight;
    
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`Prize: ${winnerData.prize}`, leftX, currentY);

    // Generate QR code and add to canvas
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, {
        width: 200,
        color: {
          dark: "#8B0000",
          light: "#FFFFFF"
        }
      });

      const qrImage = new Image();
      qrImage.onload = () => {
        ctx.drawImage(qrImage, canvas.width - 250, 150, 200, 200);
        
        // Add footer text
        ctx.fillStyle = '#8B0000';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Scan QR Code to Claim Prize', canvas.width / 2, canvas.height - 60);
        ctx.fillText(`Card ID: ${generatedCard.winnerCardId}`, canvas.width / 2, canvas.height - 30);

        // Download the image
        const link = document.createElement('a');
        link.download = `winner_card_${winnerData.playerName}_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      qrImage.src = qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code for image:', error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl p-6 text-center text-white max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">🏆 Winner Card Generator 🏆</h2>
        <p className="text-sm opacity-90">Generate official winner verification card</p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
        <h3 className="font-bold text-lg mb-3">Winner Details</h3>
        <div className="text-left space-y-2 text-sm">
          <p><span className="font-semibold">Player:</span> {winnerData.playerName}</p>
          <p><span className="font-semibold">ID:</span> {winnerData.playerId}</p>
          <p><span className="font-semibold">Game:</span> {winnerData.gameType}</p>
          <p><span className="font-semibold">Score:</span> {winnerData.score}</p>
          <p><span className="font-semibold">Prize:</span> {winnerData.prize}</p>
        </div>
      </div>

      {!generatedCard ? (
        <button
          onClick={generateWinnerCard}
          disabled={isGenerating}
          className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all ${
            isGenerating
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isGenerating ? 'Generating...' : 'Generate Winner Card'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-300 font-semibold mb-2">✅ Winner Card Generated!</p>
            <p className="text-sm">Card ID: {generatedCard.winnerCardId}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={downloadWinnerCardImage}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Download Image
            </button>
            <button
              onClick={createWinnerCardPDF}
              className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinnerCardGenerator;
