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
  FaRedo,
  FaMoneyBillWave,
  FaUser
} from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import CertificateGenerator from '../Components/utility/CertificateGenerator';
import { GameSessionGuard } from '../Components/game/GameSessionGuard';
import { useAuthStore } from '../stores/authStore';

// Reward thresholds
const REWARD_THRESHOLDS = {
  FREE_GAME: 500,
  COFFEE: 1000,
  CASH_PRIZE: 1500
};

// Stage requirements
const STAGE_REQUIREMENTS = {
  1: { score: 500, reward: 'free_game' },
  2: { score: 1000, reward: 'coffee' },
  3: { score: 1500, reward: 'cash_prize' }
};

const TriviaGame = () => {
  const navigate = useNavigate();
  const { user, session } = useAuthStore();

  // State Management
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [usedQuestionIndices, setUsedQuestionIndices] = useState<number[]>([]);
  const [currentReward, setCurrentReward] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // If user is authenticated, use their name and id
  const googleName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0];
  const googleId = user?.id;

  // Fetch questions with difficulty scaling
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        // Fetch questions based on current stage (higher stages get harder questions)
        const difficultyRange = [
          Math.max(1, currentStage - 1),
          Math.min(3, currentStage + 1)
        ];
        
        const { data, error } = await supabase
          .from("questionstrivia")
          .select("*")
          .gte('difficulty', difficultyRange[0])
          .lte('difficulty', difficultyRange[1])
          .order('difficulty', { ascending: currentStage < 2 })
          .limit(20); // More questions for variety

        if (error) throw error;
        if (data) {
          setQuestions(data);
          // Pre-load next stage questions
          preloadNextStageQuestions(currentStage + 1);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        showFeedback("Failed to load questions. Please try again.", 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [currentStage]);

  const preloadNextStageQuestions = async (nextStage: number) => {
    if (nextStage > 3) return;
    
    const difficultyRange = [
      Math.max(1, nextStage - 1),
      Math.min(3, nextStage + 1)
    ];
    
    await supabase
      .from("questionstrivia")
      .select("*")
      .gte('difficulty', difficultyRange[0])
      .lte('difficulty', difficultyRange[1])
      .limit(20);
  };

  // Timer logic with dynamic timing based on stage
  useEffect(() => {
    let interval: number;
    const timeLimit = Math.max(10, 15 - (currentStage - 1) * 2); // Decreases with stage
    
    if (gameStarted && timer > 0 && !isGameOver) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !isGameOver) {
      handleNextQuestion();
    }

    return () => clearInterval(interval);
  }, [timer, gameStarted, isGameOver, currentStage]);

  // Feedback system
  const showFeedback = (message: string, type: 'success' | 'error' | 'info') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Game Logic Methods
  const getRandomQuestionIndex = useCallback(() => {
    if (usedQuestionIndices.length >= questions.length) return -1;

    const availableIndices = questions
      .map((_, index) => index)
      .filter(index => !usedQuestionIndices.includes(index));

    if (availableIndices.length === 0) return -1;

    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    return availableIndices[randomIndex];
  }, [questions, usedQuestionIndices]);

  const startGame = async () => {
    let nameToUse = playerName;
    let idToUse = playerId;
    if (user && googleName && googleId) {
      nameToUse = googleName;
      idToUse = googleId;
      setPlayerName(googleName);
      setPlayerId(googleId);
    } else {
      if (playerName.trim().length < 3) {
        showFeedback("Please enter a name with at least 3 characters", 'error');
        return;
      }
      const newPlayerId = uuidv4();
      setPlayerId(newPlayerId);
      idToUse = newPlayerId;
    }
    try {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      
      // Check player progress
      const { data: progress } = await supabase
        .from("player_progress")
        .select("*")
        .eq("player_id", idToUse)
        .single();

      if (progress) {
        setCurrentStage(progress.current_stage);
      } else {
        // Initialize player progress
        await supabase
          .from("player_progress")
          .insert({
            player_id: idToUse,
            current_stage: 1,
            sessions_played: 0
          });
      }

      setGameStarted(true);
      setIsGameOver(false);
      setScore(0);
      setStreak(0);
      const initialIndex = getRandomQuestionIndex();
      if (initialIndex !== -1) {
        setCurrentQuestionIndex(initialIndex);
        setUsedQuestionIndices([initialIndex]);
        setTimer(Math.max(10, 15 - (currentStage - 1) * 2));
      }
    } catch (error) {
      console.error("Game start error:", error);
      showFeedback("Failed to start game. Please try again.", 'error');
    }
  };

  const handleAnswer = (selectedIndex: number) => {
    const isCorrect = questions[currentQuestionIndex]?.correct_option === selectedIndex;
    
    if (isCorrect) {
      const pointsEarned = timer * (10 + (currentStage - 1) * 2); // More points in higher stages
      setScore((prev) => prev + pointsEarned);
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
      showFeedback(`Correct! +${pointsEarned} points`, 'success');
    } else {
      setStreak(0);
      showFeedback("Wrong answer!", 'error');
    }
    
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    const nextIndex = getRandomQuestionIndex();

    if (nextIndex !== -1) {
      setCurrentQuestionIndex(nextIndex);
      setUsedQuestionIndices((prev) => [...prev, nextIndex]);
      setTimer(Math.max(10, 15 - (currentStage - 1) * 2));
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    setIsLoading(true);
    try {
      setIsGameOver(true);
      setGameStarted(false);

      // Determine rewards based on stage and score
      let rewardEarned = null;
      const stageRequirement = STAGE_REQUIREMENTS[currentStage as keyof typeof STAGE_REQUIREMENTS];
      
      if (score >= stageRequirement.score) {
        rewardEarned = stageRequirement.reward;
        setCurrentReward(rewardEarned);
        
        // Update player progress
        const { data: progress } = await supabase
          .from("player_progress")
          .select("*")
          .eq("player_id", playerId)
          .single();

        if (progress) {
          const newStage = Math.min(3, progress.current_stage + 1);
          await supabase
            .from("player_progress")
            .update({
              total_wins: progress.total_wins + 1,
              last_win: new Date().toISOString(),
              rewards_claimed: [...progress.rewards_claimed, rewardEarned],
              current_stage: newStage,
              sessions_played: progress.sessions_played + 1
            })
            .eq("player_id", playerId);
          
          setCurrentStage(newStage);
        }
      }

      // Save score to leaderboard
      await supabase.from("scores").insert({
        player_name: playerName,
        player_id: playerId,
        score: score,
        game_type_id: "trivia", // Use game_type_id instead of game_type
        stage: currentStage,
        session_id: sessionId,
        streak: maxStreak
      });

      // Save certificate if reward earned
      if (rewardEarned) {
        await supabase.from("certificates").insert({
          player_name: playerName,
          player_id: playerId,
          game_type_id: "trivia", // Use game_type_id instead of game_type
          score: score,
          reward_type: rewardEarned,
          timestamp: new Date().toISOString(),
          session_id: sessionId
        });
      }

      // Navigate to game result page
      navigate('/game-result', {
        state: {
          sessionId: sessionId,
          playerId: playerId,
          playerName: playerName, // Pass player name for display
          gameType: 'Trivia', // Pass game type name
          score: score,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error("Game end error:", error);
      showFeedback("Failed to save game results. Please try again.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCertificateError = (error: Error) => {
    console.error("Certificate error:", error);
    showFeedback("Failed to generate certificate. Please try again.", 'error');
  };

  // Restart and Navigation Methods
  const restartGame = () => {
    if (questions.length === 0) {
      showFeedback("Questions are not loaded yet. Please wait and try again.", 'error');
      return;
    }

    setUsedQuestionIndices([]);
    const initialIndex = getRandomQuestionIndex();
    if (initialIndex !== -1) {
      setIsGameOver(false);
      setGameStarted(true);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setCurrentQuestionIndex(initialIndex);
      setUsedQuestionIndices([initialIndex]);
      setTimer(Math.max(10, 15 - (currentStage - 1) * 2));
      setCurrentReward(null);
    } else {
      showFeedback("No questions available to restart the game.", 'error');
    }
  };

  const goBackToStart = () => {
    setIsGameOver(false);
    setGameStarted(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setTimer(15);
    setPlayerName("");
    setPlayerId("");
    setSessionId("");
    setCurrentStage(1);
    navigate("/");
  };

  // Reward icon component
  const RewardIcon = ({ rewardType }: { rewardType: string }) => {
    switch (rewardType) {
      case 'free_game':
        return <FaGamepad className="text-2xl text-blue-400 animate-pulse" />;
      case 'coffee':
        return <FaCoffee className="text-2xl text-yellow-400 animate-pulse" />;
      case 'cash_prize':
        return <FaMoneyBillWave className="text-2xl text-green-400 animate-pulse" />;
      default:
        return <FaMedal className="text-2xl text-purple-400 animate-pulse" />;
    }
  };

  // Render Methods
  const renderStartScreen = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center 
      bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 
      p-4 text-center overflow-hidden relative"
    >
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          transition: { duration: 15, repeat: Infinity }
        }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          transition: { duration: 20, repeat: Infinity }
        }}
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl w-full max-w-md relative border border-white/20"
      >
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-yellow-400/20 flex items-center justify-center">
          <FaGamepad className="text-2xl text-yellow-400" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
            Trivia
          </span> Challenge
        </h1>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Only show name input if not authenticated */}
          {!user ? (
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-4 pl-12 rounded-xl bg-white/20 backdrop-blur-sm 
                text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300
                border border-white/20 transition-all duration-300"
                maxLength={20}
              />
              <FaQuestionCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 text-xl" />
            </div>
          ) : (
            <div className="text-white text-lg font-semibold flex items-center justify-center gap-2">
              <FaUser className="text-yellow-400" />
              {googleName}
            </div>
          )}
          
          {/* Stage indicator */}
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-white/80 mb-1">Current Stage</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((stage) => (
                <motion.div
                  key={stage}
                  animate={{
                    scale: currentStage === stage ? 1.2 : 1,
                    backgroundColor: currentStage >= stage ? 'rgba(234, 179, 8, 0.8)' : 'rgba(255, 255, 255, 0.1)'
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                >
                  {stage}
                </motion.div>
              ))}
            </div>
            <p className="text-white/60 text-sm mt-2">
              {currentStage === 1 && "Win a free game at 500 points"}
              {currentStage === 2 && "Win coffee at 1000 points"}
              {currentStage === 3 && "Win $1000 at 1500 points"}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            disabled={playerName.trim().length < 3 || isLoading}
            className={`w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 
            text-indigo-900 rounded-xl font-bold uppercase tracking-wide 
            hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed 
            flex items-center justify-center gap-3 shadow-md`}
          >
            {isLoading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-indigo-900 border-t-transparent rounded-full"
              />
            ) : (
              <>
                <FaPlayCircle className="text-xl" />
                Start Game
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  const renderQuestionScreen = () => (
    <motion.div 
      key="question-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center 
      bg-gradient-to-br from-indigo-900 to-purple-900 p-4 relative"
    >
      {/* Background animation */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%'],
          transition: { duration: 15, repeat: Infinity, repeatType: "reverse" }
        }}
      />

      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 z-10">
        {/* Score and Timer Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3 bg-black/30 rounded-full px-4 py-2"
          >
            <FaClock className="text-yellow-400 text-xl md:text-2xl" />
            <span className="font-bold text-lg md:text-xl text-white">
              {timer}s
            </span>
          </motion.div>
          
          <div className="flex items-center gap-4">
            {/* Streak indicator */}
            {streak > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-green-500/20 rounded-full px-3 py-1"
              >
                <span className="text-white font-bold">🔥</span>
                <span className="text-green-300 font-bold">{streak}x</span>
              </motion.div>
            )}
            
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 bg-black/30 rounded-full px-4 py-2"
            >
              <FaTrophy className="text-green-400 text-xl md:text-2xl" />
              <span className="font-bold text-lg md:text-xl text-white">
                {score}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Stage progress */}
        <div className="mb-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{
                width: `${Math.min(100, (score / STAGE_REQUIREMENTS[currentStage as keyof typeof STAGE_REQUIREMENTS].score) * 100)}%`              }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
            />
          </div>
          <p className="text-white/70 text-sm mt-1 text-right">
            {score}/{STAGE_REQUIREMENTS[currentStage as keyof typeof STAGE_REQUIREMENTS].score} to next reward
          </p>
        </div>

        {/* Question */}
        <motion.div
          key={`question-${currentQuestionIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mb-10"
        >
          <h2 className="text-2xl md:text-3xl text-white text-center font-semibold leading-tight">
            {questions[currentQuestionIndex]?.question}
          </h2>
        </motion.div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions[currentQuestionIndex]?.options.map((option: string, index: number) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: index * 0.1 }
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAnswer(index)}
              className="py-4 px-6 bg-white/20 backdrop-blur-sm 
              text-white rounded-xl hover:bg-white/30 
              transition-all text-left font-medium text-lg
              flex items-center gap-3 border border-white/20
              hover:border-yellow-400/50"
            >
              <span className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full">
                {String.fromCharCode(65 + index)}
              </span>
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
      {/* Confetti particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/50 pointer-events-none"
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
        />
      ))}

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
          <h2 className="text-4xl text-white mb-2 font-bold tracking-tight">
            Game Completed!
          </h2>
          <p className="text-white/70">Stage {currentStage}</p>
        </motion.div>

        {/* Score Display */}
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
              transition: { stiffness: 300 }
            }}
            className="text-5xl font-bold text-yellow-300 
            bg-white/15 rounded-xl py-3 shadow-inner"
          >
            {score}
          </motion.div>
          
          {/* Streak display */}
          {maxStreak > 3 && (
            <div className="mt-3 text-green-300 flex items-center justify-center gap-2">
              <span>🔥</span>
              <span>Max Streak: {maxStreak}x</span>
            </div>
          )}
        </motion.div>

        {/* Achievements Section */}
        <AnimatePresence mode="wait">
          {currentReward && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-3 mb-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-yellow-300 text-xl font-semibold 
                bg-yellow-500/20 rounded-xl p-3 flex items-center justify-center gap-3"
              >
                <RewardIcon rewardType={currentReward} />
                {currentReward === 'free_game' && 'Free Game Unlocked!'}
                {currentReward === 'coffee' && 'Free Coffee Unlocked!'}
                {currentReward === 'cash_prize' && '$1000 Prize Unlocked!'}
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.3 } }}
                className="text-white/70 text-sm"
              >
                {currentStage < 3 ? (
                  `Advancing to stage ${currentStage + 1}!`
                ) : (
                  "You've completed all stages!"
                )}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next stage requirements */}
        {currentStage < 3 && !currentReward && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 bg-black/30 rounded-xl p-4"
          >
            <h3 className="text-white/80 mb-2">Next Stage Requirements</h3>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Stage {currentStage + 1}</span>
              <span className="text-yellow-300">
                {score}/{STAGE_REQUIREMENTS[currentStage + 1 as keyof typeof STAGE_REQUIREMENTS].score} points
              </span>
            </div>
            <div className="mt-2 text-sm text-white/50">
              Reward: {STAGE_REQUIREMENTS[currentStage + 1 as keyof typeof STAGE_REQUIREMENTS].reward.replace('_', ' ')}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={restartGame}
            className="w-full py-3 bg-green-600 hover:bg-green-700
            text-white rounded-xl transition-all shadow-lg 
            flex items-center justify-center gap-2"
          >
            <FaRedo />
            Play Again
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={goBackToStart}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700
            text-white rounded-xl transition-all shadow-lg 
            flex items-center justify-center gap-2"
          >
            <FaHome />
            Main Menu
          </motion.button>
        </div>
      </motion.div>
      
      {/* Feedback notification */}
      {feedback && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 
          rounded-xl px-6 py-3 shadow-lg z-50 ${
            feedback.type === 'error' ? 'bg-red-500' :
            feedback.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
          }`}
        >
          <p className="text-white font-medium">{feedback.message}</p>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <GameSessionGuard>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center bg-indigo-900"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full"
            />
          </motion.div>
        ) : isGameOver ? (
          renderEndScreen()
        ) : gameStarted ? (
          renderQuestionScreen()
        ) : (
          renderStartScreen()
        )}
      </AnimatePresence>
    </GameSessionGuard>
  );
};

export default TriviaGame;