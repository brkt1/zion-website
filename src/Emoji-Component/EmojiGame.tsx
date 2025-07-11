import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon,
  ClockIcon,
  HeartIcon,
  LightBulbIcon,
  TrophyIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import CertificateGenerator from '../Components/utility/CertificateGenerator';
import { GameSessionGuard } from '../Components/game/GameSessionGuard';

// Reward thresholds
const REWARD_THRESHOLDS = {
  FREE_GAME: 5,
  COFFEE: 10,
  CASH_PRIZE: 15
};

// Stage requirements
const STAGE_REQUIREMENTS = {
  1: { score: 5, reward: 'free_game' },
  2: { score: 10, reward: 'coffee' },
  3: { score: 15, reward: 'cash_prize' }
};

const EmojiMastermind = () => {
  const navigate = useNavigate();

  // State Management
  const [currentEmoji, setCurrentEmoji] = useState(null);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [remainingTries, setRemainingTries] = useState(3);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [emojis, setEmojis] = useState([]);
  const [nextStageEmojis, setNextStageEmojis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [hintCount, setHintCount] = useState(3);
  const [currentReward, setCurrentReward] = useState(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [hintString, setHintString] = useState('');
  const [timer, setTimer] = useState(30);
  const [playerName, setPlayerName] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [playerId, setPlayerId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // Fetch emojis with difficulty scaling
  const fetchEmojis = useCallback(async () => {
    setIsLoading(true);
    try {
      if (nextStageEmojis.length > 0 && currentStage === 2) {
        setEmojis(nextStageEmojis);
        selectRandomEmoji(nextStageEmojis);
      } else {
        const difficultyRange = [
          Math.max(1, currentStage - 1),
          Math.min(3, currentStage + 1)
        ];
        
        const { data, error } = await supabase
          .from('emojis')
          .select('*')
          .gte('difficulty', difficultyRange[0])
          .lte('difficulty', difficultyRange[1])
          .order('difficulty', { ascending: currentStage < 2 });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setEmojis(data);
          selectRandomEmoji(data);
          // Pre-load next stage emojis
          preloadNextStageEmojis(currentStage + 1);
        } else {
          console.error('No emojis found');
        }
      }
    } catch (error) {
      console.error('Error fetching emojis:', error);
      setFeedback('Failed to load emojis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentStage, nextStageEmojis]);

  const preloadNextStageEmojis = async (nextStage) => {
    if (nextStage > 3) return;
    
    const difficultyRange = [
      Math.max(1, nextStage - 1),
      Math.min(3, nextStage + 1)
    ];
    
    const { data } = await supabase
      .from('emojis')
      .select('*')
      .gte('difficulty', difficultyRange[0])
      .lte('difficulty', difficultyRange[1])
      .limit(20);
    setNextStageEmojis(data || []);
  };

  const selectRandomEmoji = (emojiList) => {
    if (emojiList.length === 0) {
      setGameOver(true);
      return;
    }

    const randomIndex = Math.floor(Math.random() * emojiList.length);
    const randomEmoji = emojiList[randomIndex];
    
    setCurrentEmoji(randomEmoji);
    setGuess('');
    setShowHint(false);
    setFeedback(null);
    setHintString('');
    setTimer(30);
  };

  const handleGuess = async () => {
    if (!currentEmoji || !guess.trim()) return;

    const userGuess = guess.toLowerCase().trim();
    const correctAnswer = currentEmoji.title.toLowerCase().trim();
    const isCorrect = userGuess === correctAnswer;

    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
      setFeedback(`Correct! 🎉 The answer is "${currentEmoji.title}".`);

      // Check for stage completion and rewards
      const stageRequirement = STAGE_REQUIREMENTS[currentStage];
      if (newScore >= stageRequirement.score) {
        setCurrentReward(stageRequirement.reward);
        
        // Update player progress
        try {
          const { data: progress } = await supabase
            .from('emoji_player_progress')
            .select('*')
            .eq('player_id', playerId)
            .single();

          if (progress) {
            const newStage = Math.min(3, progress.current_stage + 1);
            await supabase
              .from('emoji_player_progress')
              .update({
                total_wins: progress.total_wins + 1,
                last_win: new Date().toISOString(),
                rewards_claimed: [...progress.rewards_claimed, stageRequirement.reward],
                current_stage: newStage,
                sessions_played: progress.sessions_played + 1
              })
              .eq('player_id', playerId);
            
            setCurrentStage(newStage);
            fetchEmojis();
          }

          // Save certificate
          await supabase.from('emoji_certificates').insert({
            player_name: playerName,
            player_id: playerId,
            game_type: 'emoji',
            score: newScore,
            reward_type: stageRequirement.reward,
            timestamp: new Date().toISOString(),
            session_id: sessionId
          });
        } catch (error) {
          console.error('Error updating progress:', error);
        }
      }

      const updatedEmojis = emojis.filter(emoji => emoji.id !== currentEmoji.id);
      setEmojis(updatedEmojis);

      setTimeout(() => {
        selectRandomEmoji(updatedEmojis);
        setHintCount(3);
      }, 1500);
    } else {
      const newTries = remainingTries - 1;
      setRemainingTries(newTries);
      setStreak(0);
      setFeedback(`Incorrect! 😢 Try again.`);

      if (newTries <= 0) {
        setGameOver(true);
      await saveScore();
      navigate('/game-result', {
        state: {
          sessionId: sessionId,
          playerId: playerId,
          playerName: playerName,
          gameType: 'Emoji Game',
          score: score,
          timestamp: new Date().toISOString()
        }
      });
      }
    }

    setGuess('');
  };

  const generateHint = () => {
    if (hintCount > 0 && currentEmoji) {
      const titleWords = currentEmoji.title.split(' ');
      const lastWord = titleWords.pop();
      const hint = `______ ${lastWord}`;
      setHintString(hint);
      setShowHint(true);
      setHintCount(prev => prev - 1);
    }
  };

  const saveScore = async () => {
    try {
      await supabase.from('emoji_scores').insert({
        player_name: playerName,
        player_id: playerId,
        score: score,
        game_type: 'emoji',
        stage: currentStage,
        session_id: sessionId,
        streak: maxStreak,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const handleSkip = () => {
    if (remainingTries > 1) {
      setRemainingTries(prev => prev - 1);
      setFeedback('Skipped! Next emoji.');
      selectRandomEmoji(emojis);
    } else {
      setFeedback('No lives left to skip!');
      setGameOver(true);
    }
  };

  const handleStartGame = () => {
    if (playerName.trim().length < 3) {
      setFeedback('Please enter a name with at least 3 characters');
      return;
    }

    const newPlayerId = uuidv4();
    const newSessionId = uuidv4();
    setPlayerId(newPlayerId);
    setSessionId(newSessionId);
    
    // Initialize player progress
    supabase.from('emoji_player_progress')
      .upsert({
        player_id: newPlayerId,
        current_stage: 1,
        sessions_played: 0
      }, { onConflict: 'player_id' });
    
    setShowIntro(false);
    fetchEmojis();
  };

  const handleRestartGame = () => {
    setScore(0);
    setRemainingTries(3);
    setGameOver(false);
    setCurrentReward(null);
    setStreak(0);
    setMaxStreak(0);
    fetchEmojis();
  };

  const handleBackToMenu = () => {
    navigate('/');
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (!showIntro && !gameOver && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && !gameOver) {
      setFeedback('Time is up! Game Over!');
      setGameOver(true);
      saveScore();
    }
    return () => clearInterval(interval);
  }, [timer, showIntro, gameOver]);

  // Initialize player progress on mount
  useEffect(() => {
    if (!showIntro) {
      fetchEmojis();
    }
  }, [showIntro, fetchEmojis]);

  // Reward icon component
  const RewardIcon = ({ rewardType }) => {
    switch (rewardType) {
      case 'free_game':
        return <GiftIcon className="w-6 h-6 text-blue-400 animate-pulse" />;
      case 'coffee':
        return <GiftIcon className="w-6 h-6 text-yellow-400 animate-pulse" />;
      case 'cash_prize':
        return <TrophyIcon className="w-6 h-6 text-green-400 animate-pulse" />;
      default:
        return <SparklesIcon className="w-6 h-6 text-purple-400 animate-pulse" />;
    }
  };

  return (
    <GameSessionGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-yellow-800 to-indigo-900 flex flex-col items-center justify-center p-4 text-white overflow-hidden relative">
        {/* Animated background bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-6 h-6 bg-white/10 rounded-full backdrop-blur-sm"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{
                y: [0, window.innerHeight],
                opacity: [1, 0],
                transition: {
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  repeatType: 'loop'
                }
              }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-4">
          <motion.div 
            className="w-full bg-white/5 backdrop-blur-lg rounded-2xl shadow-xl border border-white/10 p-4 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {showIntro ? (
              <motion.div className="text-center space-y-6">
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-transparent bg-clip-text">
                    Emoji Mastermind
                  </h1>
                  <p className="text-sm sm:text-base text-white/80 font-light">
                    Crack the emoji enigma! Use your wits to decipher hidden phrases.
                    Earn rewards and climb the leaderboards 🏆
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="space-y-3 mb-4">
                    <div className="flex flex-col sm:flex-row justify-center gap-2">
                      <div className="bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">
                        <SparklesIcon className="w-4 h-4 text-amber-400" />
                        <span>Stage-based Rewards</span>
                      </div>
                      <div className="bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">
                        <ClockIcon className="w-4 h-4 text-amber-400" />
                        <span>Timed Challenges</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-amber-400">Enter Your Name</h3>
                    <input
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name..."
                      required
                      className="w-full px-4 py-3 bg-white/5 rounded-xl text-center text-base focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-white/40"
                    />
                    <p className="text-xs text-white/60">Your name will be used for the leaderboard</p>
                  </div>
                </div>

                <motion.button
                  onClick={handleStartGame}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={!playerName.trim()}
                  className={`w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl text-base font-semibold ${
                    !playerName.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Start Challenge 🚀
                </motion.button>
              </motion.div>
            ) : gameOver ? (
              <motion.div 
                className="text-center space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-transparent bg-clip-text">
                    Game Complete!
                  </h2>
                  <div className="text-xl font-light text-white/80">
                    Final Score: <span className="font-bold text-amber-400">{score}</span>
                  </div>
                  {maxStreak > 3 && (
                    <div className="text-sm text-green-300">
                      🔥 Max Streak: {maxStreak}x
                    </div>
                  )}

                  {/* Reward display */}
                  {currentReward && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-center gap-2"
                    >
                      <RewardIcon rewardType={currentReward} />
                      <span className="text-yellow-300">
                        {currentReward === 'free_game' && 'Free Game Unlocked!'}
                        {currentReward === 'coffee' && 'Free Coffee Unlocked!'}
                        {currentReward === 'cash_prize' && '$1000 Prize Unlocked!'}
                      </span>
                    </motion.div>
                  )}

                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    {/* CertificateGenerator will be rendered by ThankYou component */}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleRestartGame}
                    className="py-2.5 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-1"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={handleBackToMenu}
                    className="py-2.5 bg-white/5 hover:bg-white/10 rounded-xl"
                  >
                    Return to Menu
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Game Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
                  <div className="text-base font-semibold text-amber-400">
                    Player: {playerName || 'Guest'}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-white/10 px-3 py-1 rounded-full text-sm">
                      <span className="text-amber-400">⭐ {score}</span>
                    </div>
                    <div className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                      <HeartIcon className="w-4 h-4 text-rose-400" />
                      <span>{remainingTries}</span>
                    </div>
                    <div className="bg-white/10 px-3 py-1 rounded-full text-sm">
                      ⏳ {timer}s
                    </div>
                    {streak > 0 && (
                      <div className="bg-green-500/20 px-3 py-1 rounded-full text-sm text-green-300">
                        🔥 {streak}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stage progress */}
                <div className="mb-2">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
  animate={{
    width: `${Math.min(100, (score / STAGE_REQUIREMENTS[currentStage].score) * 100)}%`
  }}
/>
                  </div>
                    <p className="text-white/70 text-xs mt-1 text-right">
                      Stage {currentStage}: {score}/{STAGE_REQUIREMENTS[currentStage] && STAGE_REQUIREMENTS[currentStage]['score']}
                    </p>
                </div>

                {/* Emoji Display */}
                <motion.div 
                  className="bg-white/5 p-6 rounded-xl border border-white/10 flex items-center justify-center"
                  key={currentEmoji?.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <span className="text-6xl sm:text-8xl">{currentEmoji?.emoji || '🎲'}</span>
                </motion.div>

                {/* Game Controls */}
                <div className="space-y-6">
                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`px-6 py-3 rounded-xl text-center border ${
                          feedback.includes('Correct') 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {feedback}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3">
                    {showHint && (
                      <div className="bg-white/10 px-4 py-2 rounded-lg text-sm border border-white/20">
                        Hint: {hintString}
                      </div>
                    )}
                    <input
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                      placeholder="Type your answer..."
                      className="w-full px-4 py-3 bg-white/5 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-white/40"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={generateHint}
                        disabled={showHint || hintCount === 0}
                        className="py-2.5 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-40 rounded-xl flex items-center justify-center gap-1"
                      >
                        <LightBulbIcon className="w-4 h-4" />
                        Hint ({hintCount})
                      </button>
                      <button
                        onClick={handleSkip}
                        className="py-2.5 text-sm bg-white/5 hover:bg-white/10 rounded-xl"
                      >
                        Skip ➔
                      </button>
                    </div>

                    <button
                      onClick={handleGuess}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl text-sm font-semibold"
                    >
                      Submit Answer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </GameSessionGuard>
  );
};

export default EmojiMastermind;