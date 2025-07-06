import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    FaGamepad, 
    FaQuestionCircle, 
    FaSmile, 
    FaHandRock, 
    FaDownload,
    FaCrown,
    FaStar,
    FaChevronRight
} from 'react-icons/fa';

const Landing = () => {
  const [showDownloadButton, setShowDownloadButton] = useState(false);

  const handleLaunchApp = () => {
    // Attempt to launch the app via custom URL scheme on user gesture
    const timeout = setTimeout(() => {
      // If app is not installed, show download button after delay
      setShowDownloadButton(true);
    }, 1500);

    window.location.href = 'zionapp://';

    // Clear timeout if app is installed and launched
    window.addEventListener('blur', () => {
      clearTimeout(timeout);
    });

    return () => {
      window.removeEventListener('blur', () => {
        clearTimeout(timeout);
      });
    };
  };

  const handleDownloadClick = () => {
    window.location.href = 'https://yenege.com';
  };

  const games = [ 
    { 
      to: "/emoji-game", 
      label: "Emoji Game", 
      description: "Guess the hidden emoji phrases",
      icon: FaSmile,
      accentColor: "bg-gold-primary"
    },
    { 
      to: "/truth-or-dare", 
      label: "Truth or Dare", 
      description: "Choose lovers or friends mode",
      icon: FaGamepad,
      accentColor: "bg-gold-secondary"
    },
    { 
      to: "/trivia-game", 
      label: "Trivia Challenge", 
      description: "Test your knowledge across categories",
      icon: FaQuestionCircle,
      accentColor: "bg-gold-primary"
    },
    { 
      to: "/rock-paper-scissors", 
      label: "Rock Paper Scissors", 
      description: "The ultimate showdown", 
      icon: FaHandRock,
      accentColor: "bg-gold-secondary"
    }
  ];

  const GameButton = ({ game, index }) => {
    const IconComponent = game.icon;
    
    return (
      <motion.div
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: index * 0.1,
          type: "spring",
          stiffness: 300,
          damping: 15
        }}
      >
        <Link to={game.to} className="block h-full group">
          <div className={`h-full flex flex-col p-6 rounded-xl
            bg-black-secondary
            relative overflow-hidden
            border border-gray-dark hover:border-gold-primary
            transition-all duration-300
            group-hover:shadow-lg group-hover:shadow-gold-primary/10`}>
            <div className={`absolute top-4 right-4 p-3 rounded-lg ${game.accentColor} bg-opacity-20 text-gold-primary`}>
              <IconComponent className="text-xl" />
            </div>
            
            <div className="flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {game.label}
                </h3>
                <p className="text-gray-light text-sm mb-4">
                  {game.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className={`h-1 w-8 rounded-full ${game.accentColor} transition-all duration-300 group-hover:w-12`}></div>
                <FaChevronRight className="text-gold-light opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-gold-primary opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-gold-secondary opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black-primary text-cream">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gold-primary filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-gold-secondary filter blur-3xl"></div>
      </div>
      
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 max-w-7xl mx-auto">
        <motion.div 
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.header 
            className="text-center mb-12"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="inline-flex items-center mb-6 px-6 py-2 rounded-full bg-black-secondary border border-gray-dark shadow-sm"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <FaCrown className="text-gold-primary mr-2" />
              <span className="font-medium text-gold-light">PREMIUM COLLECTION</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="text-gold-primary">Yenege</span> GameHub
            </h1>
            
            <div className="max-w-2xl mx-auto">
              <p className="text-lg text-gray-light mb-6">
                Experience premium entertainment with our curated collection of exclusive games
              </p>
              
              <div className="h-px bg-gradient-to-r from-transparent via-gray-medium to-transparent my-6"></div>
              
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 rounded-full bg-gold-primary mr-2"></div>
                  <span className="text-gray-light">No ads</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 rounded-full bg-gold-primary mr-2"></div>
                  <span className="text-gray-light">Premium content</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 rounded-full bg-gold-primary mr-2"></div>
                  <span className="text-gray-light">Exclusive features</span>
                </div>
              </div>
            </div>
          </motion.header>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {games.map((game, index) => (
              <GameButton key={game.to} game={game} index={index} />
            ))}
          </motion.div>

          {showDownloadButton ? (
            <motion.div
              className="flex justify-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                onClick={handleDownloadClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-medium flex items-center shadow-lg hover:shadow-xl transition-all group"
              >
                <span className="relative">
                  <span className="block group-hover:opacity-0 transition-opacity">
                    <FaDownload className="mr-3 inline" />
                    Download Now
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Unlock All Games</span>
                    <FaChevronRight className="ml-2" />
                  </span>
                </span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="flex justify-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                onClick={handleLaunchApp}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8  rounded-lg bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-medium flex items-center shadow-lg hover:shadow-xl transition-all group"
              >
                <span>Launch App</span>
              </motion.button>
            </motion.div>
          )}

          <motion.footer 
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="inline-flex flex-col items-center">
                <img 
                  src="/zionlogo.png" 
                  alt="GameHub Logo"
                  className="h-[200px] opacity-90 hover:opacity-100 transition-opacity"
                />
              <p className="text-sm text-gray-medium">
                © {new Date().getFullYear()} Yenege GameHub. All rights reserved.
              </p>
            </div>
          </motion.footer>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
