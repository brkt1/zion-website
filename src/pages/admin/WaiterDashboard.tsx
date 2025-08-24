import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaQrcode, 
  FaGamepad, 
  FaArrowLeft, 
  FaPlus, 
  FaCopy, 
  FaDownload,
  FaHistory,
  FaUsers,
  FaTrophy,
  FaPrint
} from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';

interface GeneratedQR {
  id: string;
  code: string;
  gameType: string;
  mode: string;
  maxPlayers?: number;
  createdAt: Date;
  isActive: boolean;
  usageCount: number;
}

const WaiterDashboard: React.FC = () => {
  const { generateQRCode } = useAdmin();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState('emoji');
  const [selectedMode, setSelectedMode] = useState('solo');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [generatedQRs, setGeneratedQRs] = useState<GeneratedQR[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentQR, setCurrentQR] = useState<GeneratedQR | null>(null);

  const gameTypes = [
    { value: 'emoji', label: 'Emoji Game', icon: '😊' },
    { value: 'trivia', label: 'Trivia Challenge', icon: '🧠' },
    { value: 'truth_dare', label: 'Truth or Dare', icon: '💕' },
    { value: 'rock_paper_scissors', label: 'Rock Paper Scissors', icon: '✂️' }
  ];

  const modes = [
    { value: 'solo', label: 'Solo Mode', description: 'Individual gameplay' },
    { value: 'multiplayer', label: 'Multiplayer Mode', description: 'Group gameplay' }
  ];

  useEffect(() => {
    // Load generated QR codes from localStorage or context
    const saved = localStorage.getItem('generatedQRs');
    if (saved) {
      setGeneratedQRs(JSON.parse(saved));
    }
  }, []);

  const handleGenerateQR = async () => {
    if (!user?.cafe_id) {
      alert('No café associated with your account');
      return;
    }

    setIsGenerating(true);
    try {
      const qrCode = await generateQRCode(
        user.cafe_id,
        selectedGameType,
        selectedMode,
        selectedMode === 'multiplayer' ? maxPlayers : undefined
      );

      const newQR: GeneratedQR = {
        id: Date.now().toString(),
        code: qrCode,
        gameType: selectedGameType,
        mode: selectedMode,
        maxPlayers: selectedMode === 'multiplayer' ? maxPlayers : undefined,
        createdAt: new Date(),
        isActive: true,
        usageCount: 0
      };

      const updatedQRs = [newQR, ...generatedQRs];
      setGeneratedQRs(updatedQRs);
      localStorage.setItem('generatedQRs', JSON.stringify(updatedQRs));

      setCurrentQR(newQR);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyQRCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('QR code copied to clipboard!');
  };

  const downloadQR = (qr: GeneratedQR) => {
    // In a real app, you would generate and download the actual QR image
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(qr.code)}`;
    link.download = `QR_${qr.gameType}_${qr.mode}_${qr.id}.txt`;
    link.click();
  };

  const printQR = (qr: GeneratedQR) => {
    // In a real app, you would print the actual QR image
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>QR Code - ${qr.gameType}</title></head>
          <body>
            <h1>QR Code for ${qr.gameType} - ${qr.mode}</h1>
            <p>Code: ${qr.code}</p>
            <p>Generated: ${qr.createdAt.toLocaleString()}</p>
            <p>Max Players: ${qr.maxPlayers || 'N/A'}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const deactivateQR = (id: string) => {
    const updatedQRs = generatedQRs.map(qr => 
      qr.id === id ? { ...qr, isActive: false } : qr
    );
    setGeneratedQRs(updatedQRs);
    localStorage.setItem('generatedQRs', JSON.stringify(updatedQRs));
  };

  const getGameTypeIcon = (type: string) => {
    return gameTypes.find(gt => gt.value === type)?.icon || '🎮';
  };

  const getGameTypeLabel = (type: string) => {
    return gameTypes.find(gt => gt.value === type)?.label || 'Unknown Game';
  };

  const getModeLabel = (mode: string) => {
    return modes.find(m => m.value === mode)?.label || 'Unknown Mode';
  };

  return (
    <div className="min-h-screen bg-black-primary text-white">
      {/* Header */}
      <div className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-light hover:text-white transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-lg flex items-center justify-center">
                <FaQrcode className="text-black-primary text-xl" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gold-primary to-gold-secondary bg-clip-text text-transparent">
                Waiter Dashboard
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-full mb-6">
              <FaQrcode className="text-black-primary text-4xl" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              QR Code Generator
            </h1>
            
            <p className="text-xl text-gray-light max-w-3xl mx-auto">
              Generate QR codes for players to access games at your café
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <div className="bg-black-secondary rounded-xl p-6 border border-gray-dark text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FaQrcode className="text-white text-xl" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {generatedQRs.length}
              </div>
              <div className="text-sm text-gray-light">Total QR Codes</div>
            </div>

            <div className="bg-black-secondary rounded-xl p-6 border border-gray-dark text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-white text-xl" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {generatedQRs.filter(qr => qr.isActive).length}
              </div>
              <div className="text-sm text-gray-light">Active Codes</div>
            </div>

            <div className="bg-black-secondary rounded-xl p-6 border border-gray-dark text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FaTrophy className="text-white text-xl" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {generatedQRs.reduce((sum, qr) => sum + qr.usageCount, 0)}
              </div>
              <div className="text-sm text-gray-light">Total Usage</div>
            </div>

            <div className="bg-black-secondary rounded-xl p-6 border border-gray-dark text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FaGamepad className="text-white text-xl" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {gameTypes.length}
              </div>
              <div className="text-sm text-gray-light">Game Types</div>
            </div>
          </motion.div>

          {/* QR Code Generator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-black-secondary rounded-2xl p-8 border border-gray-dark mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Generate New QR Code</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Game Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-light mb-2">
                  Game Type
                </label>
                <select
                  value={selectedGameType}
                  onChange={(e) => setSelectedGameType(e.target.value)}
                  className="w-full bg-gray-dark border border-gray-medium rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-primary"
                >
                  {gameTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-light mb-2">
                  Game Mode
                </label>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full bg-gray-dark border border-gray-medium rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-primary"
                >
                  {modes.map(mode => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Players (for multiplayer) */}
              {selectedMode === 'multiplayer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-light mb-2">
                    Max Players
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                    className="w-full bg-gray-dark border border-gray-medium rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-primary"
                  />
                </div>
              )}

              {/* Generate Button */}
              <div className="flex items-end">
                <button
                  onClick={handleGenerateQR}
                  disabled={isGenerating}
                  className="w-full px-6 py-3 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-black-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FaPlus />
                      <span>Generate QR</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mode Description */}
            <div className="bg-gray-dark/50 rounded-lg p-4">
              <p className="text-gray-light text-sm">
                <strong>Mode:</strong> {modes.find(m => m.value === selectedMode)?.description}
                {selectedMode === 'multiplayer' && ` • Maximum ${maxPlayers} players can join this game room.`}
              </p>
            </div>
          </motion.div>

          {/* Generated QR Codes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Generated QR Codes</h2>
              <div className="flex items-center space-x-2 text-gray-light">
                <FaHistory className="text-sm" />
                <span className="text-sm">Recently generated codes</span>
              </div>
            </div>

            {generatedQRs.length === 0 ? (
              <div className="bg-black-secondary rounded-2xl p-12 border border-gray-dark text-center">
                <div className="w-24 h-24 bg-gray-dark rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaQrcode className="text-gray-medium text-4xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No QR Codes Generated</h3>
                <p className="text-gray-light mb-6">
                  Generate your first QR code to get started
                </p>
                <button
                  onClick={handleGenerateQR}
                  className="px-6 py-3 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200"
                >
                  Generate QR Code
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedQRs.map(qr => (
                  <motion.div
                    key={qr.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-black-secondary rounded-xl p-6 border transition-all duration-200 ${
                      qr.isActive ? 'border-gray-dark hover:border-gold-primary' : 'border-gray-dark opacity-60'
                    }`}
                  >
                    {/* QR Code Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getGameTypeIcon(qr.gameType)}</span>
                        <div>
                          <h4 className="font-semibold">{getGameTypeLabel(qr.gameType)}</h4>
                          <p className="text-sm text-gray-light">{getModeLabel(qr.mode)}</p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        qr.isActive ? 'bg-green-500' : 'bg-gray-500'
                      }`}></div>
                    </div>

                    {/* QR Code Details */}
                    <div className="space-y-3 mb-4">
                      <div className="bg-gray-dark rounded-lg p-3">
                        <p className="text-xs text-gray-light mb-1">QR Code</p>
                        <p className="font-mono text-sm break-all">{qr.code}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-light">Created</p>
                          <p>{qr.createdAt.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-light">Usage</p>
                          <p>{qr.usageCount} times</p>
                        </div>
                      </div>

                      {qr.maxPlayers && (
                        <div className="text-sm">
                          <p className="text-gray-light">Max Players</p>
                          <p>{qr.maxPlayers}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => copyQRCode(qr.code)}
                        className="px-3 py-2 bg-gray-dark text-white text-sm rounded-lg hover:bg-gray-medium transition-colors flex items-center space-x-2"
                      >
                        <FaCopy className="text-xs" />
                        <span>Copy</span>
                      </button>
                      
                      <button
                        onClick={() => downloadQR(qr)}
                        className="px-3 py-2 bg-gray-dark text-white text-sm rounded-lg hover:bg-gray-medium transition-colors flex items-center space-x-2"
                      >
                        <FaDownload className="text-xs" />
                        <span>Download</span>
                      </button>
                      
                      <button
                        onClick={() => printQR(qr)}
                        className="px-3 py-2 bg-gray-dark text-white text-sm rounded-lg hover:bg-gray-medium transition-colors flex items-center space-x-2"
                      >
                        <FaPrint className="text-xs" />
                        <span>Print</span>
                      </button>
                      
                      {qr.isActive && (
                        <button
                          onClick={() => deactivateQR(qr.id)}
                          className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && currentQR && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black-secondary rounded-2xl p-8 border border-gray-dark max-w-md w-full"
          >
            <div className="text-center">
              <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center mx-auto mb-6">
                <div className="text-center">
                  <span className="text-4xl">{getGameTypeIcon(currentQR.gameType)}</span>
                  <p className="text-xs text-gray-600 mt-2">QR Code Generated</p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-4">
                QR Code Created Successfully!
              </h3>
              
              <p className="text-gray-light mb-6">
                Share this QR code with players to access {getGameTypeLabel(currentQR.gameType)} in {getModeLabel(currentQR.mode)} mode.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => copyQRCode(currentQR.code)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200"
                >
                  Copy QR Code
                </button>
                
                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-full px-4 py-3 bg-gray-dark text-white font-medium rounded-lg hover:bg-gray-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WaiterDashboard;
