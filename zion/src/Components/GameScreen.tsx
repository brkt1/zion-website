import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUserPlus, FaUsers, FaArrowLeft } from "react-icons/fa";

const Friends = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameMode } = location.state || {};

  const [players, setPlayers] = useState([]);
  const [currentPlayerInput, setCurrentPlayerInput] = useState("");

  // Fetch game mode validation
  useEffect(() => {
    if (!gameMode) {
      navigate("/"); // Adjust this based on your routing
    }
  }, [gameMode, navigate]);

  // Add player logic
  const addPlayer = () => {
    if (currentPlayerInput.trim() && !players.includes(currentPlayerInput.trim())) {
      const newPlayers = [...players, currentPlayerInput.trim()];
      setPlayers(newPlayers);
      setCurrentPlayerInput("");

      // Navigate to game mode if conditions are met
      if ((gameMode === "1vs1" && newPlayers.length === 2) || 
          (gameMode === "group-challenge" && newPlayers.length > 1)) {
        navigate("/friends-game-mode", { state: { players: newPlayers, gameMode } });
      }
    }
  };

  // Render player input
  const renderPlayerInput = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      className="w-full max-w-md mx-auto bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-blue-900/30"
    >
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-md flex items-center"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
      <motion.div className="text-center mb-6">
        <div className="flex justify-center items-center mb-4">
          <FaUsers className="text-4xl text-blue-400 mr-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {gameMode === "1vs1" ? "1 vs 1 Battle" : "Group Challenge"}
          </h2>
        </div>

        <motion.div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          <input
            type="text"
            value={currentPlayerInput}
            onChange={(e) => setCurrentPlayerInput(e.target.value)}
            placeholder={`Enter Player ${players.length + 1} Name`}
            className="flex-grow px-4 py-3 bg-blue-900/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={addPlayer}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center"
          >
            <FaUserPlus className="mr-2" /> Add
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f1c] to-[#0d1323]">
      <AnimatePresence exitBeforeEnter>
        {renderPlayerInput()}
      </AnimatePresence>
    </div>
  );
};

export default Friends;