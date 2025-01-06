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
        bgColor: "bg-gradient-to-r from-yellow-500 to-red-500",
        icon: FaSmile
    }, { 
        to: "/truth-or-dare", 
        label: "Truth or Dare", 
        bgColor: "bg-gradient-to-r from-pink-500 to-orange-500",
        icon: FaGamepad
    },
    { 
        to: "/trivia-game", 
        label: "Trivia Challenge", 
        bgColor: "bg-gradient-to-r from-purple-600 to-blue-500",
        icon: FaQuestionCircle
    },
    { 
        to: "/rock-paper-scissors", 
        label: "Rock Paper Scissors", 
        bgColor: "bg-gradient-to-r from-green-500 to-blue-500", 
        icon: FaHandRock
    }
];

const GameButton = ({ game, index }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
                delay: 0.2 + index * 0.1,
                type: "spring",
                stiffness: 300
            }}
        >
            <Link
                to={game.to} 
                className="block"
                aria-label={`Play ${game.label}`}
            >
                <div 
                    className={`
                        w-full 
                        flex 
                        items-center 
                        justify-between 
                        px-6
                        py-4 
                        rounded-xl 
                        text-white 
                        font-bold 
                        ${game.bgColor} 
                        hover:shadow-2xl 
                        transition-all 
                        duration-300 
                        shadow-lg 
                        cursor-pointer
                        text-center
                        group
                        relative
                        overflow-hidden
                    `}
                >
                    <div className="flex items-center gap-4">
                        <game.icon className="text-2xl group-hover:animate-pulse" />
                        {game.label}
                    </div>
                    <FaPlayCircle className="opacity-50 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Subtle background effect */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>
            </Link>
        </motion.div>
    );
};

const Landing = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div className="flex-grow flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                        duration: 0.5, 
                        type: "spring",
                        stiffness: 200
                    }}
                    className="w-full max-w-md p-8 space-y-8 bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-gray-700/50"
                >
                    <div className="text-center">
                        <motion.h1 
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4"
                        >
                            Game Hub
                        </motion.h1>
                        <p className="text-gray-300 mb-6 text-lg font-medium">
                            Choose your adventure and let the fun begin!
                        </p>
                    </div>

                    <div className="space-y-4">
                        {games.map((game, index) => (
                            <GameButton key={game.to} game={game} index={index} />
                        ))}
                    </div>

                    <div className="text-center text-gray-400 mt-4 space-y-4">
                        <p className="text-sm italic">
                            New games coming soon! Stay tuned.
                        </p>
                    </div>
                <div className="flex justify-center mt-6">
                    <img src="zionlogo.png" alt="Logo" className="w-50 h-[150px] object-contain" />
                </div>
                </motion.div>
              
            </div>

            {/* Decorative background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default Landing;