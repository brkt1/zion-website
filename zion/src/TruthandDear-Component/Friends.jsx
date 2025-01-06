import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Friends = () => {
  const navigate = useNavigate();

  const onSelect1vs1 = () => {
    navigate('/friends-game-mode', { 
      state: { 
        gameMode: '1vs1',
        category: 'default-category' // You can modify this as needed
      } 
    });
  };

  const onSelectGroupChallenge = () => {
    navigate('/friends-game-mode', { 
      state: { 
        gameMode: 'group-challenge',
        category: 'default-category' // You can modify this as needed
      } 
    });
  };

  const handleBackButtonClick = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-md flex flex-col items-center space-y-8">
        <motion.img
          src="image 2.png"
          alt="Friends"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-auto object-cover mb-12 mx-auto"
        />

        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-4"
        >
          Welcome to the Friends Game!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg text-center mb-6"
        >
          Choose your game mode!
        </motion.p>

        <div className="space-y-6 w-full">
          {/* 1 vs 1 Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-white/20 hover:border-white/40 transition-all"
            onClick={onSelect1vs1}
          >
            <button className="w-full py-5 text-xl font-semibold text-white/90 hover:text-white flex items-center justify-center space-x-4 group">
              <span>1 vs 1 Battle</span>
            </button>
          </motion.div>

          {/* Group Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-white/20 hover:border-white/40 transition-all"
            onClick={onSelectGroupChallenge}
          >
            <button className="w-full py-5 text-xl font-semibold text-white/90 hover:text-white flex items-center justify-center space-x-4 group">
              <span>Group Challenge</span>
            </button>
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.button
          onClick={handleBackButtonClick}
          className="mt-6 py-2 px-4 bg-white/10 rounded-lg border border-white/20 hover:border-white/40 transition-all"
        >
          Back
        </motion.button>
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-gray-600 text-[50px] md:text-4xl pt-12"
      >
        Mavka
      </motion.footer>
    </div>
  );
};

export default Friends;