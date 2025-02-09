import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    FaGamepad, 
    FaQuestionCircle, 
    FaSmile, 
    FaHandRock, 
    FaPlayCircle 
} from 'react-icons/fa';
const games = [ 
    { 
      to: "/emoji-game", 
      label: "Emoji Game", 
      bgColor: "bg-gradient-to-br from-pink-500/90 to-yellow-500/90",
      icon: FaSmile,
      position: "top-right",
      rotate: 12,
      iconColor: "text-yellow-300"
    },
    { 
      to: "/truth-or-dare", 
      label: "Truth or Dare", 
      bgColor: "bg-gradient-to-br from-purple-600/90 to-cyan-400/90",
      icon: FaGamepad,
      position: "top-right",
      rotate: -8,
      iconColor: "text-purple-200"
    },
    { 
      to: "/trivia-game", 
      label: "Trivia Challenge", 
      bgColor: "bg-gradient-to-br from-indigo-600/90 to-blue-400/90",
      icon: FaQuestionCircle,
      position: "top-right",
      rotate: 15,
      iconColor: "text-blue-200"
    },
    { 
      to: "/rock-paper-scissors", 
      label: "Rock Paper Scissors", 
      bgColor: "bg-gradient-to-br from-green-500/90 to-emerald-400/90", 
      icon: FaHandRock,
      position: "top-right",
      rotate: -12,
      iconColor: "text-emerald-200"
    }
  ];
  const GameButton = ({ game, index }) => {
    const positionClasses = {
      "top-right": "-top-12 -right-10",
      "top-left": "-top-12 -left-6",
      "bottom-right": "-bottom-6 -right-6",
      "bottom-left": "-bottom-6 -left-6"
    };
  
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          delay: index * 0.1,
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
      >
        <Link to={game.to} className="block group h-full">
          <div className={`
            h-10 flex flex-col items-center justify-center m-5
            p-4 rounded-xl
            ${game.bgColor}
            hover:shadow-2xl transition-all duration-300
            relative overflow-visible
          `}>
            {/* Bursting Icon */}
            <motion.div 
              className={`
                absolute p-4 rounded-2xl backdrop-blur-sm
                ${positionClasses[game.position]}
                ${game.iconColor}
              `}
              whileHover={{ rotate: game.rotate + 5, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <game.icon className="text-5xl drop-shadow-lg" />
            </motion.div>
  
            {/* Game Title - Centered properly */}
            <div className="flex-grow flex items-center justify-center w-full"> {/* Added container div */}
              <h3 className="text-xl font-semibold text-center z-10 px-4">
                {game.label}
              </h3>
            </div>
  
            {/* Dynamic Border */}
            <div className={`
              absolute inset-0 border-2 rounded-xl transition-all
              opacity-50 hover:opacity-70 
              ${game.iconColor.replace("text", "border")}
            `}/>
          </div>
        </Link>
      </motion.div>
    );
  };

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="flex-grow flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-2xl p-8 space-y-8 bg-gray-800/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-700/30"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          {/* Header Section */}
          <motion.div 
            className="text-center space-y-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
              Game Hub
            </h1>
            <p className="text-gray-300 text-lg font-light tracking-wide">
              Choose your adventure and let the fun begin!
            </p>
          </motion.div>

          {/* Game Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games.map((game, index) => (
              <GameButton key={game.to} game={game} index={index} />
            ))}
          </div>

          {/* Footer Section */}
          <motion.div 
            className="text-center pt-6 border-t border-gray-700/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-sm text-gray-400 font-light italic">
              New games coming soon! Stay tuned.
            </p>
            <div className="mt-4 flex justify-center">
              <img 
                src="zionlogo.png" 
                alt="Logo" 
                className="w-32 opacity-80 hover:opacity-100 transition-opacity" 
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
export default Landing;