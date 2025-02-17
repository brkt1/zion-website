import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaQuestionCircle, 
  FaPlayCircle, 
  FaArrowRight, 
  FaTrophy, 
  FaClock,
  FaGamepad,
  FaMedal,
  FaCoffee,
  FaHome,
  FaDownload,
  FaRedo,
  FaSave
} from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import CertificateGenerator from '../Components/CertificateGenerator';

const shuffleArray = (array: any[]) => {
  return array.sort(() => Math.random() );
};

const TriviaGame = () => {
  const navigate = useNavigate();

  // State Management
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [usedQuestionIndices, setUsedQuestionIndices] = useState([]);
  const [hasWonCoffee, setHasWonCoffee] = useState(false);
  const [hasWonPrize, setHasWonPrize] = useState(false);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from("questionstrivia")
          .select("*");

        if (error) throw error;
        if (data) setQuestions(data.slice(0, 15)); // Limit to 15 questions
      } catch (error) {
        console.error("Error fetching questions:", error);
        alert("Failed to load questions. Please try again.");
      }
    };

    fetchQuestions();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      handleNextQuestion();
    }

    return () => clearInterval(interval);
  }, [timer, gameStarted]);

  // Game Logic Methods
  const getRandomQuestionIndex = useCallback(() => {
    if (usedQuestionIndices.length >= 15) return -1; // Stop after 15 questions

    let index;
    do {
      index = Math.floor(Math.random() * questions.length);
    } while (usedQuestionIndices.includes(index as never));

    return index;
  }, [questions, usedQuestionIndices]);

  const startGame = () => {
    if (playerName.trim().length >= 3) {
      setPlayerId(uuidv4());
      setGameStarted(true);
      setIsGameOver(false);
      setScore(0);
      const initialIndex = getRandomQuestionIndex();
      setCurrentQuestionIndex(initialIndex);
      setUsedQuestionIndices([initialIndex as never]);
      setTimer(15);
    }
  };

  const handleAnswer = (selectedIndex: number) => {
    if ((questions[currentQuestionIndex] as any)?.correct_option === selectedIndex) {
      setScore((prev) => prev + timer * 10);
    }
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    const nextIndex = getRandomQuestionIndex();

    if (nextIndex !== -1) {
      setCurrentQuestionIndex(nextIndex);
      setUsedQuestionIndices((prev) => [...prev, nextIndex as never]);
      setTimer(15);
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    try {
      setGameStarted(false);
      setIsGameOver(true);

      // Check for rewards and save winner if they won something
      const hasWon = score > 1000;
      if (hasWon) {
        setHasWonCoffee(true);
        try {
          const { data: { session }, error: authError } = await supabase.auth.getSession();
          
          if (authError) {
            console.error('Auth error:', authError);
            return;
          }

          // Save winner automatically when they win something
          const { error: saveError } = await supabase
            .from("winners")
            .insert({
              player_name: playerName,
              game_type: "trivia",
              score: score,
              won_coffee: hasWonCoffee,
              won_prize: hasWonPrize,
              // Only include user_id if we have a session
              ...(session?.user?.id ? { user_id: session.user.id } : {})
            });

          if (saveError) {
            if (saveError.code === '42501') {
              console.log('Permission denied, saving without auth');
              // Try again without user_id
              const { error: retryError } = await supabase
                .from("winners")
                .insert({
                  player_name: playerName,
                  game_type: "trivia",
                  score: score,
                  won_coffee: hasWonCoffee,
                  won_prize: hasWonPrize
                });
              if (retryError) throw retryError;
            } else {
              throw saveError;
            }
          }
        } catch (error) {
          console.error('Error saving winner:', error);
        }
      }

      // Submit score to leaderboard
      await supabase.from("scores").insert({
        player_name: playerName,
        score: score,
      });

      // Fetch leaderboard
      const { data } = await supabase
        .from("scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(5);

      if (data && score > (data[0]?.score || 0)) {
        setHasWonPrize(true);
      }
    } catch (error) {
      console.error("Game end error:", error);
    }
  };

const handleCertificateError = (error: Error) => {
  console.error("Error generating certificate:", error);
  const errorMessages = {
    'Missing player information': 'Please complete your profile',
    'default': 'Unable to generate certificate'
  };
  // Handle error display to user here
};

  // Restart and Navigation Methods
  const restartGame = () => {
    setIsGameOver(false);
    setGameStarted(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setUsedQuestionIndices([]);
    setTimer(15);
    setHasWonCoffee(false);
    setHasWonPrize(false);
  };

  const goBackToStart = () => {
    setIsGameOver(false);
    setGameStarted(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setTimer(15);
    setPlayerName("");
    setPlayerId("");
    navigate("/");
  };

  // Render Methods
  const renderStartScreen = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1, 
        backgroundPosition: ['0% 50%', '100% 50%']
      }}
      className="min-h-screen flex flex-col items-center justify-center 
      bg-gradient-to-r from-indigo-600 via-purple-00 to-pink-600 
      p-4 text-center overflow-hidden"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/20 backdrop-blur-xl rounded-3xl p-10 shadow-2xl w-full max-w-md relative"
      >
        <div className="absolute top-4 left-4 text-white/50">
          <FaGamepad className="text-4xl" />
        </div>
        
        <h1 className="text-5xl font-extrabold mb-8 text-white drop-shadow-lg">
          Trivia <span className="text-yellow-300">Challenge</span>
        </h1>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-4 pl-10 rounded-xl bg-white/30 backdrop-blur-sm 
              text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300
              transition-all duration-300"
            />
            <FaQuestionCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            disabled={playerName.trim().length < 3}
            className="w-full py-4 bg-yellow-400 text-indigo-900 
            rounded-xl font-bold uppercase tracking-wide 
            hover:bg-yellow-500 transition-all 
            disabled:opacity-50 disabled:cursor-not-allowed 
            flex items-center justify-center gap-3 shadow-lg"
          >
            <FaPlayCircle className="text-xl" />
            Start Game
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  const renderQuestionScreen = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center 
      bg-gradient-to-br from-indigo-900 to-purple-900 p-4"
    >
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3 text-white"
          >
            <FaClock className="text-yellow-400 text-2xl" />
            <span className="font-bold text-xl">{timer}s</span>
          </motion.div>
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3 text-white"
          >
            <FaTrophy className="text-green-400 text-2xl" />
            <span className="font-bold text-xl">{score}</span>
          </motion.div>
        </div>

        <motion.h2 
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl text-white text-center mb-10 font-semibold"
        >
          {(questions[currentQuestionIndex] as any)?.question}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shuffleArray((questions[currentQuestionIndex] as any)?.options).map((option: any, index: number) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(index)}
              className="py-4 px-6 bg-white/20 backdrop-blur-sm 
              text-white rounded-xl hover:bg-white/30 
              transition-all text-center font-medium text-lg
              flex items-center justify-center gap-3"
            >
              <FaArrowRight className="text-white/70" />
              {option}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderEndScreen = () => (
    <motion.div
      key="end-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-indigo-900 to-purple-900 p-4 
      overflow-hidden relative"
    >
      <motion.div 
        initial={{ scale: 0.7, rotate: -10 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          transition: { 
            type: "spring", 
            stiffness: 120, 
            damping: 12 
          }
        }}
        className="w-full max-w-md bg-white/20 backdrop-blur-2xl 
        rounded-3xl p-8 shadow-2xl text-center border-2 border-white/30
        relative overflow-hidden"
      >
        {/* Animated Background Effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 -z-10"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.5, 0],
            transition: { 
              duration: 3, 
              repeat: Infinity 
            }
          }}
        />
  
        {/* Confetti-like Particle Effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: -50,
                opacity: 1,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                y: window.innerHeight,
                x: Math.random() * window.innerWidth,
                opacity: [1, 0],
                rotate: Math.random() * 360
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatType: "loop"
              }}
              className="absolute w-2 h-2 rounded-full bg-white/50"
            />
          ))}
        </div>
  
        {/* Trophy/Medal Section */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            transition: { 
              type: "spring", 
              delay: 0.2 
            }
          }}
          className="relative mb-6"
        >
          <FaMedal 
            className="text-7xl text-yellow-400 mx-auto mb-4 
            drop-shadow-[0_0_15px_rgba(250,204,21,0.7)] animate-bounce"
          />
          <h2 
            className="text-4xl text-white mb-2 font-bold 
            tracking-tight drop-shadow-lg"
          >
            Game Completed!
          </h2>
        </motion.div>
  
        {/* Score Display with Animated Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: 0.3 }
          }}
          className="mb-6"
        >
          <p className="text-2xl text-white/80 mb-2">
            Your Final Score
          </p>
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: [0.8, 1.1, 1],
              transition: { 
                type: "spring",
                stiffness: 300
              }
            }}
            className="text-5xl font-bold text-yellow-300 
            bg-white/15 rounded-xl py-3 shadow-inner"
          >
            {score}
          </motion.div>
        </motion.div>
  
        {/* Achievements Section with Enhanced Animations */}
        <AnimatePresence mode="wait">
          {(hasWonCoffee || hasWonPrize) && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-3 mb-4"
            >
              {hasWonCoffee && (
                <div className="text-green-300 text-xl font-semibold 
                bg-green-500/20 rounded-xl p-3 flex items-center justify-center">
                  <FaCoffee className="mr-2 animate-pulse" /> 
                  Free Coffee Unlocked!
                </div>
              )}
              {hasWonPrize && (
                <div className="text-yellow-300 text-xl font-semibold 
                bg-yellow-500/20 rounded-xl p-3 flex items-center justify-center">
                  <FaTrophy className="mr-2 animate-pulse" /> 
                  Grand Prize Winner!
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
  
        {/* Action Buttons with Enhanced Hover Effects */}
        <div className="space-y-4">
          <CertificateGenerator
            playerName={playerName}
            playerId={playerId}
            score={score}
            hasWonCoffee={hasWonCoffee}
            hasWonPrize={hasWonPrize}
            gameType="trivia"
            onError={handleCertificateError}
          />
          {[
            { 
              label: "Restart Game", 
              icon: FaRedo, 
              onClick: restartGame, 
              color: "bg-green-600 hover:bg-green-700" 
            },
            { 
              label: "Back to Start", 
              icon: FaHome, 
              onClick: goBackToStart, 
              color: "bg-red-600 hover:bg-red-700" 
            }
          ].map(({ label, icon: Icon, onClick, color }) => (
            <motion.button
              key={label}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 15px rgba(0,0,0,0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onClick}
              aria-label={label}
              className={`w-full py-4 text-white rounded-xl 
              transition-all shadow-lg flex items-center justify-center 
              space-x-2 ${color}`}
            >
              <Icon />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
  // Main Render
  return (
    <>
      {isGameOver ? renderEndScreen() : gameStarted ? renderQuestionScreen() : renderStartScreen()}
    </>
  );
};

export default TriviaGame;
