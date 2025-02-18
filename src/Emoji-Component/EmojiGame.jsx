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
  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-yellow-800 to-indigo-900 flex flex-col items-center justify-center p-4 text-white overflow-hidden relative">
    {/* Animated background bubbles */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-6 h-6 bg-white/10 rounded-full backdrop-blur-sm"
          // ... keep existing motion props
        />
      ))}
    </div>

    <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-4">
      <motion.div 
        className="w-full bg-white/5 backdrop-blur-lg rounded-2xl shadow-xl border border-white/10 p-4 space-y-6"
        // ... keep existing motion props
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
                    <span>3 Daily Rewards</span>
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
              // ... keep motion props
              className={`w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl text-base font-semibold ${
                !playerName.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Start Challenge 🚀
            </motion.button>
          </motion.div>
        ) : gameOver ? (
          <motion.div className="text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-transparent bg-clip-text">
                Game Complete!
              </h2>
              <div className="text-xl font-light text-white/80">
                Final Score: <span className="font-bold text-amber-400">{score}</span>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <CertificateGenerator
                  playerName={playerName}
                  score={score}
                  className="w-full"
                />
              </div>
            </div>
            <button
              onClick={handleBackButtonClick}
              className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm"
            >
              Return to Menu
            </button>
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
              </div>
            </div>

            {/* Emoji Display */}
            <motion.div 
              className="bg-white/5 p-6 rounded-xl border border-white/10 flex items-center justify-center"
              // ... keep motion props
            >
              <span className="text-6xl sm:text-8xl">{currentEmoji?.emoji || '🎲'}</span>
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
);
};

export default EmojiMastermind;
