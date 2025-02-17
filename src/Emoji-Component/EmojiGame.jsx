import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon,
  ClockIcon,
  HeartIcon,
  LightBulbIcon 
} from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import CertificateGenerator from '../Components/CertificateGenerator';

// Utility function to shuffle array
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
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
  const [isLoading, setIsLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [hintCount, setHintCount] = useState(3);
  const [rewardMessage, setRewardMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [hintString, setHintString] = useState('');
  const [timer, setTimer] = useState(30); // Timer state
  const [playerName, setPlayerName] = useState(''); // Default player name

  // Fetch emojis from Supabase
  const fetchEmojis = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('emojis')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching emojis:', error);
        setIsLoading(false);
        return; // Exit the function if there's an error
      }
      console.log('Fetched emojis:', data); // Log the fetched emojis

      if (data && data.length > 0) {
        setEmojis(data);
        selectRandomEmoji(data);
      } else {
        console.error('No emojis found');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching emojis:', error);
      setIsLoading(false);
    }
  };

  const selectRandomEmoji = (emojiList) => {
    if (emojiList.length === 0) return;

    const randomIndex = Math.floor(Math.random() * emojiList.length);
    const randomEmoji = emojiList[randomIndex];
    
    setCurrentEmoji(randomEmoji);
    setGuess('');
    setShowHint(false);
    setFeedback(null);
    setHintString(''); // Reset hint string when a new emoji is selected
    setTimer(30); // Reset timer when a new emoji is selected
  };

  const handleGuess = async () => {
    if (!currentEmoji) return;

    const userGuess = guess.toLowerCase().trim();
    const correctAnswer = currentEmoji.title.toLowerCase().trim();

    const isCorrect = userGuess === correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback(`Correct! 🎉 The answer is "${currentEmoji.title}".`); // Updated feedback for correct answer
      setRewardMessage('You earned a point!');

      // Coffee reward after 10 correct answers
      if (score + 1 === 10) {
        setRewardMessage('☕ You earned a Coffee for answering 10 questions!');
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
              game_type: "emoji",
              score: score + 1,
              won_coffee: true,
              won_prize: false,
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
                  game_type: "emoji",
                  score: score + 1,
                  won_coffee: true,
                  won_prize: false
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

      const updatedEmojis = emojis.filter(emoji => emoji.id !== currentEmoji.id);

      if (updatedEmojis.length === 0) {
        setGameOver(true);
        return;
      }

      setTimeout(() => {
        selectRandomEmoji(updatedEmojis);
        setEmojis(updatedEmojis);
        setHintCount(3);
      }, 1500);
    } else {
      setRemainingTries(prev => Math.max(0, prev - 1));
      setFeedback(`Incorrect! 😢`); // Updated feedback for incorrect answer

      if (remainingTries <= 1) {
        setGameOver(true);
      }
    }

    setGuess('');
  };

  const generateHint = () => {
    if (hintCount > 0) {
      const titleWords = currentEmoji.title.split(' ');
      const lastWord = titleWords.pop(); // Get the last word
      const hint = `______ ${ lastWord}`; // Create the hint string
      setHintString(hint); // Set the hint string
      setShowHint(true); // Show the hint
      setHintCount(prev => prev - 1); // Decrement hint count
    }
  };

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const handleSkip = () => {
    if (remainingTries > 1) {
      setRemainingTries(prev => prev - 1);
      setFeedback('Skipped! Next emoji.');
      selectRandomEmoji(emojis);
    } else {
      setFeedback('No lives left to skip!');
    }
  };

  const handleStartGame = () => {
    setShowIntro(false);
    fetchEmojis();
  };

  useEffect(() => {
    if (!showIntro) fetchEmojis();
  }, [showIntro]);

  useEffect(() => {
    if (timer > 0 && !gameOver) {
      const countdown = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setFeedback('Time is up! Game Over!');
      setGameOver(true);
    }
  }, [timer, gameOver]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-yellow-800 to-indigo-900 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Animated background bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: -100,
              x: Math.random() * window.innerWidth,
              rotate: Math.random() * 360
            }}
            transition={{
              duration: Math.random() * 10 + 8,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
            className="absolute w-8 h-8 bg-white/10 rounded-full backdrop-blur-sm"
          />
        ))}
      </div>
  
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8 space-y-8"
        >
          {showIntro ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                  Emoji Mastermind
                </h1>
                <p className="text-lg text-white/80 font-light leading-relaxed">
                  Crack the emoji enigma! Use your wits to decipher hidden phrases<br />
                  Earn rewards and climb the leaderboards 🏆
                </p>
              </div>
  
              <div className="bg-gradient-to-r from-white/5 to-transparent p-6 rounded-xl border border-white/10">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-center gap-4">
                    <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5 text-cyan-400" />
                      <span className="font-medium">3 Daily Rewards</span>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-purple-400" />
                      <span className="font-medium">Timed Challenges</span>
                    </div>
                  </div>
                </div>
  
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-cyan-400">Enter Your Name</h3>
                  <input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    required
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-white/40"
                  />
                  <p className="text-sm text-white/60">Your name will be used for the leaderboard and certificates</p>
                </div>

              </div>
  
              <motion.button
                onClick={handleStartGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!playerName.trim()}
                className={`w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-cyan-500/20 transition-all ${
                  !playerName.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Start Challenge 🚀
              </motion.button>

            </motion.div>
          ) : gameOver ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-500 text-transparent bg-clip-text">
                  Game Complete!
                </h2>
                <div className="text-2xl font-light text-white/80">
                  Final Score: <span className="font-bold text-cyan-400">{score}</span>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <CertificateGenerator
                    playerName={playerName}
                    score={score}
                    className="w-full"
                  />
                </div>
              </div>
              <button
                onClick={handleBackButtonClick}
                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors duration-200"
              >
                Return to Menu
              </button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Game Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="text-xl font-semibold text-cyan-400">
                  Player: {playerName || 'Guest'}
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white/10 px-4 py-2 rounded-full">
                    <span className="text-cyan-400 font-semibold">⭐ {score}</span>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                    <HeartIcon className="w-5 h-5 text-rose-400" />
                    <span>{remainingTries}</span>
                  </div>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-full">
                  ⏳ {timer}s
                </div>
              </div>
  
              {/* Emoji Display */}
              <motion.div 
                key={currentEmoji?.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/5 p-8 rounded-2xl border border-white/10 flex items-center justify-center"
              >
                <span className="text-8xl">{currentEmoji?.emoji || '🎲'}</span>
              </motion.div>
  
              {/* Game Controls */}
              <div className="space-y-6">
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-cyan-500/10 text-cyan-400 px-6 py-3 rounded-xl text-center border border-cyan-500/20"
                  >
                    {feedback}
                  </motion.div>
                )}
  
                <div className="space-y-4">
                  {showHint && (
                    <div className="bg-white/10 px-6 py-3 rounded-xl text-center text-lg border border-white/20">
                      Hint: {hintString}
                    </div>
                  )}
                  <input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                    placeholder="Type your answer here..."
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-white/40"
                  />

  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={generateHint}
                      disabled={showHint || hintCount === 0}
                      className="py-4 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl transition-colors flex items-center justify-center gap-2"
                    >
                      <LightBulbIcon className="w-5 h-5" />
                      Hint ({hintCount})
                    </button>
                    <button
                      onClick={handleSkip}
                      className="py-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
                    >
                      Skip ➔
                    </button>
                  </div>
  
                  <button
                    onClick={handleGuess}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-2xl font-semibold shadow-lg transition-all"
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
  );
};

export default EmojiMastermind;
