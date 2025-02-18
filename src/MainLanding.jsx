import React from 'react';
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
      bgColor: "bg-gradient-to-br from-amber-900 via-amber-500 to-amber",
      icon: FaSmile,
      position: "top-left",
      rotate: 12,
      iconColor: "text-amber-100"
    },
    { 
      to: "/truth-or-dare", 
      label: "Truth or Dare", 
      bgColor: "bg-gradient-to-br from-purple-900 via-fuchsia-500 to-rose",
      icon: FaGamepad,
      position: "top-left",
      rotate: -8,
      iconColor: "text-purple-100"
    },
    { 
      to: "/trivia-game", 
      label: "Trivia Challenge", 
      bgColor: "bg-gradient-to-br from-cyan-900 via-sky-500 to-blue",
      icon: FaQuestionCircle,
      position: "bottom-left",
      rotate: 12,
      iconColor: "text-cyan-100"
    },
    { 
      to: "/rock-paper-scissors", 
      label: "Rock Paper Scissors", 
      bgColor: "bg-gradient-to-br from-emerald-900 via-teal-500 to-green", 
      icon: FaHandRock,
      position: "bottom-left",
      rotate: -12,
      iconColor: "text-emerald-100"
    }
];

const GameButton = ({ game, index }) => {
    const positionClasses = {
      "top-right": "md:-top-12 md:-right-10 top-[-2rem] right-[-1rem]",
      "top-left": "md:-top-12 md:-left-10 top-[-2rem] left-[-1rem]",
      "bottom-right": "md:-bottom-6 md:-right-6 bottom-[-1rem] right-[-1rem]",
      "bottom-left": "md:-bottom-6 md:-left-6 bottom-[-1rem] left-[-1rem]"
    };

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          delay: index * 0.07,
          type: "spring",
          stiffness: 280,
          damping: 18
        }}
      >
        <Link to={game.to} className="block group h-full">
          <div className={`
            h-30 flex flex-col items-center justify-center m-3
            p-4 rounded-2xl shadow-xl
            ${game.bgColor}
            hover:shadow-2xl transition-all duration-300
            relative overflow-visible
          `}>
            <motion.div 
              className={`
                absolute p-3 rounded-xl bg-black/20 backdrop-blur-lg
                ${positionClasses[game.position]}
                ${game.iconColor}
              `}
              whileHover={{ rotate: game.rotate + 4, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 220 }}
            >
              <game.icon className="text-4xl md:text-5xl drop-shadow-xl" />
            </motion.div>

            <div className="flex-grow flex items-center justify-center w-full">
              <h3 className="text-xl font-bold text-center z-10 px-4 
                text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200">
                {game.label}
              </h3>
            </div>

            <div className={`
              absolute inset-0 border-2 rounded-2xl transition-all
              opacity-50 hover:opacity-80
              ${game.iconColor.replace("text", "border")}
            `}/>
          </div>
        </Link>
      </motion.div>
    );
};

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <div className="flex-grow flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-2xl p-6 md:p-8 space-y-6 bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-amber-400/30"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <motion.div 
            className="text-center space-y-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-2xl font-bold text-transparent bg-clip-text 
              bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mb-2
              font-['Bebas_Neue'] tracking-wide">
              HAVE A BEAUTIFUL TIME
            </h1>
            <p className="text-amber-200/90 text-lg font-light tracking-wide">
              Future is now!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {games.map((game, index) => (
              <GameButton key={game.to} game={game} index={index} />
            ))}
          </div>

          <motion.div 
            className="text-center pt-6 border-t border-amber-400/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="mt-4 flex justify-center">
              <motion.img 
                src="/zionlogo.png" 
                alt="GameHub Logo"
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className="w-40 opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;