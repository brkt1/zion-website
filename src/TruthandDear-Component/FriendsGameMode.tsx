import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FaUserPlus, 
  FaGamepad,
  FaUser,
  FaTimes,
  FaArrowLeft // Import the back arrow icon
} from "react-icons/fa";
import {supabase} from "../supabaseClient";
import { GameSessionGuard } from '../Components/game/GameSessionGuard';
import { useSessionStore } from '../stores/sessionStore';

const FriendsGameMode = () => {
 const location = useLocation();
  const navigate = useNavigate();
  const { category, gameMode } = location.state || {};
  const { startSession } = useSessionStore();

  // Design Tokens
  const designTokens = {
    background: "bg-gradient-to-br from-[#1a1a2e] to-[#16213e]",
    primaryButton: "bg-[#6a5acd] hover:bg-[#5a4abd] text-white",
    secondaryButton: "bg-[#4a4a6a] hover:bg-[#3a3a5a] text-white",
    cardBackground: "bg-[#2a2a4a] bg-opacity-70 backdrop-blur-lg",
    textColor: "text-[#e6e6fa]",
    accentColor: "text-[#7b68ee]"
  };

  // State Management
  const [players, setPlayers] = useState([]);
  const [currentStep, setCurrentStep] = useState("player-input");
  const [playerCount, setPlayerCount] = useState(2);
  const [currentPlayerInput, setCurrentPlayerInput] = useState("");
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerChoice, setPlayerChoice] = useState("");
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState({
    Truth: [],
    Dare: []
  });
  const [sessionDisplayedQuestions, setSessionDisplayedQuestions] = useState({
    Truth: [],
    Dare: []
  });
  // Fetch Questions from Supabase
  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from("frquetion")
          .select("question, type");

        if (error) throw error;
        
        if (data && data.length > 0) {
          const questionsByType = {
            Truth: data.filter(item => item.type === 'Truth').map(item => item.question),
            Dare: data.filter(item => item.type === 'Dare').map(item => item.question)
          };
          
          setQuestions(questionsByType);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        // Fallback questions
        setQuestions({
          Truth: [
            "What's your biggest secret?",
            "What's the most embarrassing thing that's happened to you?",
            "Tell us about a time you were really scared."
          ],
          Dare: [
            "Do a silly dance for 30 seconds",
            "Call a friend and sing a song",
            "Eat a spoonful of something spicy"
          ]
        });
      }
    };

    fetchAllQuestions();
  }, []);

  // Question Fetch Logic
  const fetchQuestion = useCallback((type) => {
    try {
      const typeQuestions = questions[type] || [];
      const sessionDisplayed = sessionDisplayedQuestions[type];

      const availableQuestions = typeQuestions.filter(
        q => !sessionDisplayed.includes(q)
      );

      if (availableQuestions.length === 0) {
        setSessionDisplayedQuestions(prev => ({
          ...prev,
          [type]: []
        }));
        setQuestion(`No ${type} questions available. Please try again.`);
        return; // Exit the function early
      }

      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      const newQuestion = availableQuestions[randomIndex];

      setSessionDisplayedQuestions(prev => ({
        ...prev,
        [type]: [...prev[type], newQuestion]
      }));

      setQuestion(newQuestion);
    } catch (error) {
      console.error("Error fetching question:", error);
      setQuestion(`No ${type} questions available. Please try again.`);
    }
  }, [questions, sessionDisplayedQuestions]);

  // Player Management Functions
  const addPlayer = () => {
    const trimmedInput = currentPlayerInput.trim();
    
    if (!trimmedInput) {
      alert("Player name cannot be empty");
      return;
    }
    
    if (players.includes(trimmedInput)) {
      alert("Player name must be unique");
      return;
    }

    const newPlayers = [...players, trimmedInput];
    setPlayers(newPlayers);
    setCurrentPlayerInput("");

    if (gameMode === "1vs1" && newPlayers.length === 2) {
      // Start game session before transitioning to game-start
      startGameSession(newPlayers);
      setCurrentStep("game-start");
    } else if (gameMode === "group-challenge" && newPlayers.length === playerCount) {
      // Start game session before transitioning to game-start
      startGameSession(newPlayers);
      setCurrentStep("game-start");
    }
  };

  // Start game session
  const startGameSession = async (playerList) => {
    try {
      // Start a 30-minute game session (1800 seconds)
      await startSession('friends-game', playerList.join(', '), 1800);
    } catch (error) {
      console.error('Failed to start game session:', error);
    }
  };

  const removePlayer = (playerToRemove) => {
    setPlayers(players.filter(player => player !== playerToRemove));
  };

  // Game Logic Functions
  const handleChoice = (choice) => {
    setPlayerChoice(choice);
    fetchQuestion(choice);
  };

  const handleNextPlayer = () => {
    setPlayerChoice("");
    setQuestion("");
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
  };

  // Render Functions
  const renderPlayerInput = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        w-full max-w-md mx-auto 
        ${designTokens.background} 
        ${designTokens.cardBackground} 
        rounded-2xl 
        p-8 
        shadow-2xl 
        border-2 
        border-purple-900/30 
        relative
        overflow-hidden
      `}
    >
      {/* Header Section */}
      <div className="relative z-10 text-center mb-6">
      
        <div className="flex justify-center items-center mb-4">
        <button 
            onClick={() => navigate(-1)} 
            className=" relative flex items-center justify-center w-10 h-10 rounded-full bg-purple-900 hover:bg-purple-900/50 transition duration-300"
          >
            <FaArrowLeft />
          </button>
          <h2 className={`ml-4 text-3xl font-bold ${designTokens.textColor}`}>
            Friends Game
          </h2>
          <FaGamepad className={`text-4xl ml-4 ${designTokens.accentColor} mr-4`} />

        
        </div>

        {/* Player Count Selector for Group Challenge */}
        {gameMode === "group-challenge" && (
          <div className="flex justify-center items-center space-x-4 mb-6">
            <span className={`${designTokens.textColor} opacity-70`}>Players:</span>
            <div className="flex items-center space-x-4 bg-purple-900/20 rounded-full p-2">
              <button 
                onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}
                className="bg-purple-700 text-white w-8 h-8 rounded-full flex items-center justify-center"
              >
                -
              </button>
              <span className={`${designTokens.textColor} text-lg font-bold`}>{playerCount}</span>
              <button 
                onClick={() => setPlayerCount(playerCount + 1)}
                className="bg-purple-700 text-white w-8 h-8 rounded-full flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Player Input */}
      <div className="relative z-10 space-y-4">
        <input 
          type="text" 
          value={currentPlayerInput} 
          onChange={(e) => setCurrentPlayerInput(e.target.value)} 
          placeholder="Enter player name" 
          className="
            w-full 
            p-3 
            rounded-lg 
            bg-purple-900/20 
            border 
            border-purple-700/30 
            focus:ring-2 
            focus:ring-purple-500 
            transition-all
            text-white
          "
        />

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addPlayer} 
          className={`
            w-full 
            ${designTokens.primaryButton} 
            p-3 
            rounded-lg 
            flex 
            items-center 
            justify-center 
            space-x-2
          `}
        >
          <FaUser  />
          <span>Add Player</span>
        </motion.button>

        {/* Player List */}
        <div className="mt-6">
          <h3 className={`text-lg ${designTokens.textColor} mb-2`}>Players:</h3>
          <div className="space-y-2">
            {players.map(( player, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="
                  flex 
                  justify-between 
                  items-center 
                  bg-purple-900/30 
                  p-2 
                  rounded-lg
                "
              >
                <span className={designTokens.textColor}>{player}</span>
                <button 
                  onClick={() => removePlayer(player)} 
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTimes />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderGameStart = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        w-full max-w-md mx-auto 
        ${designTokens.background} 
        ${designTokens.cardBackground} 
        rounded-2xl 
        p-8 
        shadow-2xl 
        border-2 
        border-purple-900/30 
        relative
        overflow-hidden
      `}
    >
      <h2 className={`text-3xl font-bold ${designTokens.textColor} text-center mb-4`}>
        It&apos;s Your Turn, {players[currentPlayerIndex]}!
      </h2>
      <div className="flex justify-center mb-4">
        <button 
          onClick={() => handleChoice("Truth")} 
          className={`${designTokens.primaryButton} p-3 rounded-lg w-1/3 mx-2`}
        >
          Truth
        </button>
        <button 
          onClick={() => handleChoice("Dare")} 
          className={`${designTokens.secondaryButton} p-3 rounded-lg w-1/3 mx-2`}
        >
          Dare
        </button>
      </div>
      {question && (
        <div className="mt-4 text-center">
          <h3 className={`text-lg ${designTokens.textColor} mb-2`}>Your Question:</h3>
          <p className={`text-xl ${designTokens.textColor}`}>{question}</p>
        </div>
      )}
      <div className="flex justify-center mt-6">
        <button 
          onClick={handleNextPlayer} 
          className={`${designTokens.primaryButton} p-3 rounded-lg`}
        >
          Next Player
        </button>
        <button 
          onClick={() => navigate('/game-result', { state: { sessionId: 'friends-game', playerId: players.join('-'), playerName: players.join(', '), gameType: 'Truth or Dare (Friends)', score: players.length, timestamp: new Date().toISOString() } })} 
          className={`${designTokens.secondaryButton} p-3 rounded-lg ml-4`}
        >
          End Game
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-4">
      <AnimatePresence>
        {currentStep === "player-input" ? (
          renderPlayerInput()
        ) : (
          <GameSessionGuard>
            {renderGameStart()}
          </GameSessionGuard>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FriendsGameMode;
