import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaUsers, FaArrowLeft } from "react-icons/fa";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-900 text-white">
      <div className="flex-grow flex flex-col items-center justify-center p-4 relative">
        {/* Back arrow button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-3 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 backdrop-blur-sm"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowLeft className="text-amber-400 text-2xl" />
        </motion.button>

        {/* Logo with golden accent */}
        <motion.div 
          className="mb-8"
          whileHover={{ scale: 1.05, rotate: 2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <img 
            src="Dare 1.png" 
            alt="Logo" 
            className="h-32 md:h-48 w-auto drop-shadow-gold"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            type: "spring",
            stiffness: 260,
            damping: 15
          }}
          className="w-full max-w-md p-8 space-y-8 bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-amber-400/30"
        >
          <div className="text-center">
            <motion.p 
              className="text-amber-200 mb-6 text-xl font-light tracking-wide"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <span className="font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                CHOOSE YOUR MODE
              </span>
            </motion.p>
          </div>

          <div className="space-y-6">
            {/* Lovers Button */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/lovers")}
              className={`
                w-full 
                flex 
                items-center 
                justify-center 
                gap-4
                py-5 
                rounded-2xl 
                font-bold 
                bg-gradient-to-r from-black via-rose-600 to-black
                hover:shadow-2xl 
                transition-all 
                duration-300 
                shadow-lg 
                cursor-pointer
                group
                relative
                overflow-visible
                text-white
              `}
            >
              <div className="absolute inset-0 border-2 border-pink-400/50 rounded-2xl opacity-50 hover:opacity-70 transition-opacity" />
              <FaHeart className="text-2xl group-hover:animate-pulse text-pink-300" />
              <span className="text-xl bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                For Lovers
              </span>
              <FaHeart className="opacity-0 group-hover:opacity-100 transition-opacity text-pink-200" />
            </motion.button>

            {/* Friends Button */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/friends")}
              className={`
                w-full 
                flex 
                items-center 
                justify-center 
                gap-4
                py-5 
                rounded-2xl 
                font-bold 
                bg-gradient-to-r from-black via-blue-500 to-black
                hover:shadow-2xl 
                transition-all 
                duration-300 
                shadow-lg 
                cursor-pointer
                group
                relative
                overflow-visible
                text-white
              `}
            >
              <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-2xl opacity-50 hover:opacity-70 transition-opacity" />
              <FaUsers className="text-2xl group-hover:animate-pulse text-cyan-300" />
              <span className="text-xl bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                For Friends
              </span>
              <FaUsers className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-200" />
            </motion.button>
          </div>

          <motion.div 
            className="text-center mt-6 pt-6 border-t border-amber-400/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm italic text-amber-400/80">
              &quot;Ready for an unforgettable experience?&quot;
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;