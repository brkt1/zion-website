import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import CertificateGenerator from '../Components/CertificateGenerator';

const EmojiMastermind = () => {
  const navigate = useNavigate();
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
  const [playerName, setPlayerName] = useState('Anonymous Player'); // Default player name

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
      setScore(prev => prev + 1);
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

          // Save winner automatically when they earn coffee
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
      const hint = `______ ${lastWord}`; // Create the hint string
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-yellow-900 to-yellow-900 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: -50,
              opacity: 0.5
            }}
            animate={{ 
              y: window.innerHeight + 50,
              x: Math.random() * window.innerWidth,
              rotate: 360
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute w-4 h-4 bg-white/20 rounded-full"
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6"
        >
{showIntro && (
  <motion.div 
    initial={{ opacity: 0, y: -50 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 1, ease: "easeOut" }}
    className="text-center bg-white/10 backdrop-blur-lg rounded-lg p-6 shadow-lg"
  >
    <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
      Emoji Mastermind
    </h1>
    <p className="text-white/90 mb-6 text-lg">
      Decode the emoji puzzle! Guess the hidden title with just 3 tries. 
      Unlock special rewards and test your emoji knowledge! 🕵️‍♂️🧩
    </p>
    <div className="mb-6 text-lg text-white/90">
      <p className="font-semibold">💡 <strong>Rewards:</strong></p>
      <ul className="list-inside list-disc space-y-2">
        <motion.li 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }} 
        >After 10 correct answers, get a Coffee! ☕</motion.li>
      </ul>
    </div>
    <div className="mb-6">
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Enter your name..."
        className="w-full py-3 px-4 bg-white/10 rounded-xl text-center text-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-white/50"
      />
    </div>
    <motion.button
      onClick={handleStartGame}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-bold shadow-lg hover:shadow-xl transition-all"
    >
      Start Game 🚀
    </motion.button>
  </motion.div>
)}


          {!showIntro && !gameOver && (
            <>
              <div className="flex justify-between mb-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full"
                >
                  <span>🏆</span>
                  <span className="font-bold">{score}</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full"
                >
                  <span>❤️</span>
                  <span className="font-bold">{remainingTries}</span>
                </motion.div>
                <motion.div 
                  className="bg-white/10 px-4 py-2 rounded-full"
                >
                  <span>⏳ {timer} sec</span>
                </motion.div>
              </div>

              {feedback && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 text-white text-center text-lg px-4 py-2 rounded-full mb-4"
                >
                  {feedback}
                </motion.div>
              )}

              <motion.div 
                key={currentEmoji?.id}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl mb-6 h-48 flex items-center justify-center bg-white/10 rounded-xl"
              >
                {currentEmoji?.emoji || '🤔'}
              </motion.div>

              <div className="flex justify-center mb-4">
                <motion.button 
                  onClick={generateHint}
                  disabled={showHint || hintCount === 0}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    px-4 py-2 rounded-full 
                    ${hintCount > 0 
                      ? 'bg-white/10 text-white' 
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
                >
                  🔍 Get Hint ({hintCount} left)
                </motion.button>
              </div>

              <div className="mb-4 h-12 flex justify-center items-center">
                {showHint && hintString && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 px-4 py-2 rounded-full"
                  >
                    {hintString}
                  </motion.div>
                )}
              </div>

              <div className="space-y-4 mb-4 ">
                <motion.input 
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Your guess..."
                  className="w-full py-3 px-4 bg-white/10 rounded-xl text-center text-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <motion.button 
                    onClick={handleGuess}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from -pink-500 to-purple-500 py-3 rounded-xl"
                  >
                    Guess 🎲
                  </motion.button>
                  <motion.button 
                    onClick={handleSkip}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 py-3 rounded-xl"
                  >
                    Skip ⏭️
                  </motion.button>
                </div>
              </div>
            </>
          )}

          {gameOver && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                Game Over!
              </h2>
              <p className="text-xl mb-6">Your Score: {score}</p>
              <p className="text-lg mb-4">{feedback}</p>
              <div className="space-y-4">
                <CertificateGenerator
                  playerName={playerName}
                  playerId={currentEmoji?.id || 'emoji-player'}
                  score={score}
                  hasWonCoffee={score >= 10}
                  hasWonPrize={false}
                  gameType="emoji"
                  onError={(error) => console.error('Certificate error:', error)}
                />
                <motion.button
                  onClick={handleBackButtonClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white"
                >
                  Back to Menu
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EmojiMastermind;
