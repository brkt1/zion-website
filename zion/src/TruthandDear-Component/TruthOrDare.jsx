import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaUsers, FaArrowLeft } from "react-icons/fa"; // Import the back arrow icon

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 transition-transform transform hover:scale-110 flex justify-center">
          <img 
            src="Dare 1.png" 
            alt="Logo" 
            className="h-32 md:h-48 w-auto transition-transform transform hover:scale-110"
          />
        </h1>

        {/* Back arrow button */}
        <button
          onClick={() => navigate(-1)} // Navigate back
          className="absolute top-4 left-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition duration-300"
        >
          <FaArrowLeft className="text-white text-2xl" />
        </button>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            type: "spring",
            stiffness: 200
          }}
          className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-700"
        >
          <div className="text-center">
            <p className="text-gray-400 mb-6 text-lg font-medium">
              Choose your game mode!
            </p>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/lovers")}
              className={`
                w-full 
                flex 
                items-center 
                justify-center 
                gap-4
                py-4 
                rounded-xl 
                text-white 
                font-bold 
                bg-gradient-to-r from-pink-500 to-red-500
                hover:shadow-2xl 
                transition-all 
                duration-300 
                shadow-lg 
                cursor-pointer
                text-center
                group
              `}
            >
              <FaHeart className="text-2xl group-hover:animate-pulse" />
              For Lovers
              <FaHeart className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/friends")}
              className={`
                w-full 
                flex 
                items-center 
                justify-center 
                gap-4
                py-4 
                rounded-xl 
                text-white 
                font-bold 
                bg-gradient-to-r from-blue-500 to-purple-600
                hover:shadow-2xl 
                transition-all 
                duration-300 
                shadow-lg 
                cursor-pointer
                text-center
                group
              `}
            >
              <FaUsers className="text-2xl group-hover:animate-pulse" />
              For Friends
              <FaUsers className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>

          <div className="text-center text-gray-500 mt-4">
            <p className="text-sm italic">
              Get ready for an exciting experience!
            </p>
          </div>
        </motion.div>
      </div>
      
 
    </div>
  );
};

export default Landing;