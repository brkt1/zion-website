import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHeart, FaDice, FaArrowLeft } from "react-icons/fa";

const Lovers = () => {
  const navigate = useNavigate();

  const onSelectCategory = (category, subtype) => {
    navigate("/game-mode", { state: { category, subtype } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900  to-gray-900 flex flex-col justify-center items-center text-white p-4">
      {/* Animated Logo */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260 }}
        className="mb-8 md:mb-12"
      >
        <img 
          src="image 1.png" 
          alt="Romantic scene" 
          className="w-auto h-auto object-cover rounded-2xl border-2 border-amber-400/30 shadow-gold"
        />
      </motion.div>

      {/* Buttons Container */}
      <div className="flex flex-col gap-6 w-full max-w-md">
        {/* Normal Button */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-black to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-4 rounded-2xl text-xl font-bold shadow-gold hover:shadow-2xl transition-all"
          onClick={() => onSelectCategory("Love", "Normal")}
        >
          <div className="flex items-center justify-center gap-3">
            <FaDice className="text-amber-100 text-2xl" />
            <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Normal Mode
            </span>
          </div>
        </motion.button>

        {/* Romantic Button */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: -1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-rose-500 to-black hover:from-rose-600 hover:to-pink-700 text-white py-4 rounded-2xl text-xl font-bold shadow-neon hover:shadow-2xl transition-all"
          onClick={() => onSelectCategory("Love", "Romantic")}
        >
          <div className="flex items-center justify-center gap-3">
            <FaHeart className="text-pink-100 text-2xl" />
            <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Romantic Mode
            </span>
          </div>
        </motion.button>
      </div>

      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate(-1)}
        className="mt-8 py-2 px-6 bg-transparent border-2 border-amber-400/50 hover:border-amber-400/80 text-amber-300 rounded-xl text-lg font-semibold backdrop-blur-sm transition-all"
      >
        <div className="flex items-center gap-2">
          <FaArrowLeft />
          <span>Back to Menu</span>
        </div>
      </motion.button>

      {/* Footer */}
      <motion.div 
        className="mt-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        
      </motion.div>
    </div>
  );
};

export default Lovers;