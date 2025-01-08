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
  FaRedo
} from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import QRCode from 'qrcode';

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

      // Check for rewards
      if (score > 1000) setHasWonCoffee(true);

      // Submit score
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

const downloadQRCode = async () => {
    console.log("Download QR Code function called");
    console.log("Player Name:", playerName);
    console.log("Player ID:", playerId);
    try {
      // Early validation
      if (!playerName || !playerId) {
        throw new Error('Missing player information');
      }
  
      // Create high-resolution canvas with modern, responsive design
      const canvas = document.createElement('canvas');
      const pixelRatio = window.devicePixelRatio || 1;
      const canvasWidth = 600;
      const canvasHeight = 800;
  
      canvas.width = canvasWidth * pixelRatio;
      canvas.height = canvasHeight * pixelRatio;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      
      const ctx = canvas.getContext('2d')!;
      ctx.scale(pixelRatio, pixelRatio);
  
      // Modern color palette with depth
      const theme = {
        background: {
          start: '#1E3A8A',  // Deep blue
          end: '#0F172A'     // Dark navy
        },
        primary: '#3B82F6',  // Vibrant blue
        secondary: '#10B981', // Emerald green
        accent: '#6366F1',   // Indigo
        text: {
          light: '#F9FAFB',  // Almost white
          muted: '#D1D5DB'   // Light gray
        }
      };
  
      // Sophisticated gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, theme.background.start);
      gradient.addColorStop(1, theme.background.end);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
      // Advanced text rendering with enhanced typography
      const renderText = (text: string, y: number, options: { size?: number; color?: string; weight?: string; align?: CanvasTextAlign } = {}) => {
        const { 
          size = 24, 
          color = theme.text.light, 
          weight = '400',
          align = 'center'
        } = options;
  
        ctx.font = `${weight} ${size}px 'Inter', 'Helvetica Neue', sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.fillText(text, canvasWidth / 2, y);
      };
  
      // Decorative elements
      const drawDecorativeShapes = () => {
        // Subtle geometric shapes
        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.lineTo(canvasWidth - 50, 50);
        ctx.lineTo(canvasWidth - 75, 75);
        ctx.lineTo(75, 75);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();
  
        // Corner accent elements
        ctx.beginPath();
        ctx.arc(50, 50, 20, 0, Math.PI * 2);
        ctx.arc(canvasWidth - 50, 50, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fill();
      };
  
      // Draw decorative elements
      drawDecorativeShapes();
  
      // Render certificate elements with improved styling
      renderText('🏆 Trivia Champion', 120, { 
        size: 42, 
        color: theme.primary, 
        weight: '700' 
      });
  
      renderText(`Congratulations, ${playerName}!`, 180, { 
        size: 32,
        color: theme.text.light,
        weight: '500'
      });
  
      renderText(`Player ID: ${playerId}`, 230, { 
        size: 24, 
        color: theme.secondary 
      });
  
      renderText(`Score: ${score} points and ${hasWonCoffee ? 'coffee' : ''} ${hasWonPrize ? '1k prize' : ''}`, 280, { 
        size: 36, 
        weight: '600', 
        color: theme.accent 
      });
  
      // QR Code generation with user information
      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, JSON.stringify({ playerName, playerId, score, hasWonCoffee, hasWonPrize }), { width: 250, errorCorrectionLevel: 'M', margin: 1 });
  
      // Draw QR Code with enhanced styling
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 20;
      console.log("Drawing QR Code on canvas...");
      ctx.drawImage(
                qrCanvas, 
                (canvasWidth - 250) / 2, 
                350, 
                250, 
                250
              );
      ctx.shadowBlur = 0;
  
      // Footer with verification text
      renderText('Official Digital Certificate', 650, { 
        size: 20, 
        color: theme.text.muted 
      });
  
      renderText('Verified by Zione', 690, { 
        size: 16, 
        color: 'rgba(255,255,255,0.5)' 
      });
  
      // Download certificate
      const filename = `trivia_champion_${playerName.replace(/\s+/g, '_')}.png`;
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = filename;
      link.click();
  
    } catch (error) {
      console.error("Error generating QR Code:", error);
      const errorMessages = {
        'Missing player information': 'Please complete your profile',
        'default': 'Unable to generate certificate'
      };
    }
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
      bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
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
          {[ 
            { 
              label: "Download Winning Card", 
              icon: FaDownload, 
              onClick: downloadQRCode, 
              color: "bg-blue-600 hover:bg-blue-700" 
            },
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
