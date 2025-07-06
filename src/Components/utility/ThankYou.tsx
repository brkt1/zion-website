import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCrown,
  FaAward,
  FaTrophy,
  FaMedal,
  FaHome,
  FaRedo,
  FaChevronRight
} from 'react-icons/fa';
import { useGameStore } from '../../app/store';
import RewardingCard from '../cards/RewardingCard';
import CertificateGenerator from './CertificateGenerator';

interface ThankYouProps {
  playerName?: string;
  playerId?: string;
  score?: number;
  hasWonCoffee?: boolean;
  hasWonPrize?: boolean;
  gameType?: string;
}

const ThankYou: React.FC<ThankYouProps> = ({ playerName, playerId, score, hasWonCoffee, hasWonPrize, gameType }) => {
  const navigate = useNavigate();
  const [trophy, setTrophy] = useState('gold');
  const [isAnimating, setIsAnimating] = useState(true);
  const resetGame = useGameStore(state => state.resetGame);

  React.useEffect(() => {
    resetGame();
  }, [resetGame]);

  const trophies = [
    { 
      type: 'gold', 
      icon: <FaTrophy className="w-20 h-20" />, 
      label: 'Golden Champion',
      color: 'text-amber-500',
      bg: 'bg-gradient-to-b from-amber-500 to-amber-700',
      border: 'border-amber-400'
    },
    { 
      type: 'platinum', 
      icon: <FaCrown className="w-20 h-20" />, 
      label: 'Platinum Winner',
      color: 'text-amber-400',
      bg: 'bg-gradient-to-b from-amber-400 to-amber-600',
      border: 'border-amber-300'
    },
    { 
      type: 'elite', 
      icon: <FaAward className="w-20 h-20" />, 
      label: 'Elite Achiever',
      color: 'text-yellow-500',
      bg: 'bg-gradient-to-b from-yellow-500 to-yellow-700',
      border: 'border-yellow-400'
    },
    { 
      type: 'premium', 
      icon: <FaMedal className="w-20 h-20" />, 
      label: 'Premium Victor',
      color: 'text-yellow-400',
      bg: 'bg-gradient-to-b from-yellow-400 to-yellow-600',
      border: 'border-yellow-300'
    }
  ];

  useEffect(() => {
    const randomTrophy = trophies[Math.floor(Math.random() * trophies.length)];
    setTrophy(randomTrophy.type);
    
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const currentTrophy = trophies.find(t => t.type === trophy);

  return (
    <div className="min-h-screen bg-black-secondary text-gray-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-amber-500/30 filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 rounded-full bg-amber-600/20 filter blur-3xl animate-pulse"></div>
        <div className="absolute top-2/3 left-2/3 w-56 h-56 rounded-full bg-yellow/20 filter blur-3xl animate-pulse"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwMDAwIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMxMTExMTEiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] opacity-10"></div>
      
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto">
        <motion.div 
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="relative bg-black-secondary/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50 p-8 sm:p-12 text-center space-y-8 overflow-hidden"
          >
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/50 rounded-tl-2xl"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-500/50 rounded-tr-2xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-500/50 rounded-bl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/50 rounded-br-2xl"></div>
            
            {/* Trophy reveal */}
            <div className="relative flex justify-center">
                <motion.div
                  initial={{ scale: 0, y: 50 }}
                  animate={{ 
                    scale: [1, 1.1, 1],
                    y: 0,
                    rotate: [0, 15, -15, 0]
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    type: "tween"
                  }}
                  className={`relative mx-auto w-48 h-48 flex items-center justify-center rounded-full bg-black-secondary border-2 ${currentTrophy?.border}/30 shadow-lg`}
                >
                <div className={`absolute inset-0 rounded-full ${currentTrophy?.bg} opacity-10`}></div>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    delay: 0.5,
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    type: "tween"
                  }}
                  className={`${currentTrophy?.color} drop-shadow-lg`}
                >
                  {currentTrophy?.icon}
                </motion.div>
              </motion.div>
              
              {/* Floating particles */}
              {isAnimating && (
                <AnimatePresence>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        opacity: 0,
                        scale: 0,
                        x: Math.random() * 100 - 50,
                        y: Math.random() * 100 - 50
                      }}
                      animate={{ 
                        opacity: [1, 0],
                        scale: [1, 1.5],
                        x: Math.random() * 200 - 100,
                        y: Math.random() * 200 - 100
                      }}
                      transition={{
                        delay: i * 0.1,
                        duration: 2,
                        ease: "easeOut"
                      }}
                      className={`absolute w-2 h-2 rounded-full ${currentTrophy?.bg}`}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="space-y-6">
              <motion.h1 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl font-bold text-white"
              >
                <span className={`bg-gradient-to-r ${currentTrophy?.bg} bg-clip-text text-transparent`}>
                  Congratulations!
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-300"
              >
                You&apos;ve earned the prestigious
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                <div className={`text-3xl sm:text-4xl font-bold ${currentTrophy?.color} mb-2`}>
                  {currentTrophy?.label} Award
                </div>
                <div className="w-32 h-1 mx-auto bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full"></div>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto"
              >
                Thank you for being a valued member of our community. Your dedication and 
                participation elevate the experience for everyone. This recognition celebrates 
                your outstanding contribution.
              </motion.p>
            </div>

            {playerName && playerId && score !== undefined && (
              <div className="mt-8 space-y-4">
                <RewardingCard 
                  playerName={playerName}
                  playerId={playerId}
                  score={score}
                  hasWonCoffee={hasWonCoffee || false}
                  hasWonPrize={hasWonPrize || false}
                  workerId="admin"
                />
                <CertificateGenerator
                  playerName={playerName}
                  playerId={playerId}
                  score={score}
                  hasWonCoffee={hasWonCoffee || false}
                  hasWonPrize={hasWonPrize || false}
                  gameType={
                    gameType === 'trivia' || gameType === 'emoji'
                      ? gameType
                      : 'trivia'
                  }
                />
              </div>
            )}

            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <motion.button
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  resetGame();
                  navigate('/qr-scan');
                }}
                className={`flex-1 flex items-center justify-center gap-3 ${currentTrophy?.bg} text-gray-900 px-6 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all`}
              >
                <FaRedo className="w-5 h-5" />
                Play Again
                <FaChevronRight className="w-4 h-4 ml-1" />
              </motion.button>
              
              <motion.button
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  resetGame();
                  navigate('/');
                }}
                className="flex-1 flex items-center justify-center gap-3 bg-black-secondary hover:bg-black text-amber-400 px-6 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/10 transition-all border border-gray-700"
              >
                <FaHome className="w-5 h-5" />
                Return Home
                <FaChevronRight className="w-4 h-4 ml-1" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Golden confetti */}
          <AnimatePresence>
            {isAnimating && (
              <>
                {[...Array(40)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0,
                      y: -10,
                      x: Math.random() * 100 - 50
                    }}
                    animate={{ 
                      opacity: [1, 0],
                      y: [0, Math.random() * 200 + 100],
                      x: Math.random() * 100 - 50,
                      rotate: Math.random() * 360
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      delay: i * 0.05,
                      duration: 3,
                      ease: "easeOut"
                    }}
                    className={`absolute w-3 h-3 ${i % 2 === 0 ? 'bg-amber-400' : 'bg-yellow'} rounded-full`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `-10%`
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-gray-500 text-sm"
        >
          © {new Date().getFullYear()} Yenege Gaming. All rights reserved.
        </motion.div>
      </div>
    </div>
  );
};

export default ThankYou;