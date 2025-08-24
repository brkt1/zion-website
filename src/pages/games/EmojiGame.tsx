import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaGamepad, 
  FaClock, 
  FaTrophy, 
  FaLightbulb,
  FaCheck,
  FaTimes,
  FaPlay,
  FaPause,
  FaRedo
} from 'react-icons/fa';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';

interface EmojiPhrase {
  id: string;
  emojis: string;
  answer: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
}

const EmojiGame: React.FC = () => {
  const { currentSession, endGame } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentPhrase, setCurrentPhrase] = useState<EmojiPhrase | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(10);
  const [gameHistory, setGameHistory] = useState<Array<{ phrase: EmojiPhrase; userAnswer: string; isCorrect: boolean; timeSpent: number }>>([]);
  const [showResults, setShowResults] = useState(false);

  // Sample emoji phrases - in production, these would come from an API
  const emojiPhrases: EmojiPhrase[] = [
    {
      id: '1',
      emojis: '🍕🍕🍕',
      answer: 'pizza pizza pizza',
      hint: 'Italian food favorite',
      difficulty: 'easy',
      timeLimit: 30
    },
    {
      id: '2',
      emojis: '🐱🐶🐰',
      answer: 'pets animals',
      hint: 'Common household companions',
      difficulty: 'easy',
      timeLimit: 25
    },
    {
      id: '3',
      emojis: '☀️🌙⭐',
      answer: 'sun moon star',
      hint: 'Things you see in the sky',
      difficulty: 'easy',
      timeLimit: 25
    },
    {
      id: '4',
      emojis: '🎭🎪🎨',
      answer: 'theater circus art',
      hint: 'Creative entertainment',
      difficulty: 'medium',
      timeLimit: 35
    },
    {
      id: '5',
      emojis: '🚀🌍👽',
      answer: 'rocket earth alien',
      hint: 'Space exploration',
      difficulty: 'medium',
      timeLimit: 35
    },
    {
      id: '6',
      emojis: '🎵🎹🎸',
      answer: 'music piano guitar',
      hint: 'Musical instruments',
      difficulty: 'medium',
      timeLimit: 30
    },
    {
      id: '7',
      emojis: '🏆🥇🎯',
      answer: 'trophy gold target',
      hint: 'Achievement symbols',
      difficulty: 'hard',
      timeLimit: 40
    },
    {
      id: '8',
      emojis: '🌊🏄‍♂️🏖️',
      answer: 'ocean surfing beach',
      hint: 'Beach activities',
      difficulty: 'hard',
      timeLimit: 40
    },
    {
      id: '9',
      emojis: '🎬🎭🎪',
      answer: 'movie theater circus',
      hint: 'Live entertainment',
      difficulty: 'hard',
      timeLimit: 45
    },
    {
      id: '10',
      emojis: '🚗✈️🚢',
      answer: 'car plane ship',
      hint: 'Transportation methods',
      difficulty: 'easy',
      timeLimit: 25
    }
  ];

  const startNewRound = useCallback(() => {
    if (currentRound > totalRounds) {
      endGameSession();
      return;
    }

    const availablePhrases = emojiPhrases.filter(phrase => 
      !gameHistory.some(history => history.phrase.id === phrase.id)
    );

    if (availablePhrases.length === 0) {
      // Reset if all phrases used
      setGameHistory([]);
      setCurrentRound(1);
      setScore(0);
    }

    const randomPhrase = availablePhrases[Math.floor(Math.random() * availablePhrases.length)];
    setCurrentPhrase(randomPhrase);
    setTimeLeft(randomPhrase.timeLimit);
    setUserAnswer('');
    setIsCorrect(null);
    setShowHint(false);
    setIsGameActive(true);
  }, [currentRound, totalRounds, gameHistory, emojiPhrases]);

  useEffect(() => {
    startNewRound();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isGameActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isGameActive) {
      handleTimeout();
    }

    return () => clearTimeout(timer);
  }, [timeLeft, isGameActive]);

  const handleTimeout = () => {
    setIsCorrect(false);
    setIsGameActive(false);
    const roundResult = {
      phrase: currentPhrase!,
      userAnswer: userAnswer || 'No answer',
      isCorrect: false,
      timeSpent: currentPhrase!.timeLimit
    };
    setGameHistory(prev => [...prev, roundResult]);
    
    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
    }, 2000);
  };

  const handleSubmit = () => {
    if (!currentPhrase || !userAnswer.trim()) return;

    const normalizedAnswer = userAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = currentPhrase.answer.toLowerCase().trim();
    
    const isAnswerCorrect = normalizedAnswer === normalizedCorrectAnswer;
    setIsCorrect(isAnswerCorrect);
    setIsGameActive(false);

    if (isAnswerCorrect) {
      const timeBonus = Math.max(0, timeLeft);
      const difficultyMultiplier = currentPhrase.difficulty === 'easy' ? 1 : currentPhrase.difficulty === 'medium' ? 1.5 : 2;
      const roundScore = Math.round((currentPhrase.timeLimit - timeLeft + timeBonus) * difficultyMultiplier);
      setScore(prev => prev + roundScore);
    }

    const roundResult = {
      phrase: currentPhrase,
      userAnswer: userAnswer,
      isCorrect: isAnswerCorrect,
      timeSpent: currentPhrase.timeLimit - timeLeft
    };
    setGameHistory(prev => [...prev, roundResult]);

    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
    }, 2000);
  };

  const endGameSession = async () => {
    try {
      if (currentSession) {
        await endGame(score);
      }
      setShowResults(true);
    } catch (error) {
      console.error('Error ending game:', error);
      setShowResults(true);
    }
  };

  const restartGame = () => {
    setCurrentRound(1);
    setScore(0);
    setGameHistory([]);
    setShowResults(false);
    startNewRound();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-black-primary text-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black-secondary rounded-2xl p-8 border border-gray-dark max-w-2xl w-full text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTrophy className="text-black-primary text-4xl" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Game Complete!</h1>
          
          <div className="space-y-4 mb-8">
            <div className="text-6xl font-bold text-gold-primary">{score}</div>
            <div className="text-xl text-gray-light">Total Score</div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-dark rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {gameHistory.filter(r => r.isCorrect).length}
                </div>
                <div className="text-sm text-gray-light">Correct Answers</div>
              </div>
              
              <div className="bg-gray-dark rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {Math.round((gameHistory.filter(r => r.isCorrect).length / gameHistory.length) * 100)}%
                </div>
                <div className="text-sm text-gray-light">Accuracy</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={restartGame}
              className="w-full px-6 py-3 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-lg hover:from-gold-secondary hover:to-gold-primary transition-all duration-200"
            >
              <FaRedo className="inline mr-2" />
              Play Again
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-gray-dark text-white font-medium rounded-lg hover:bg-gray-medium transition-colors"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentPhrase) {
    return (
      <div className="min-h-screen bg-black-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-light">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-primary text-white">
      {/* Header */}
      <div className="relative z-10 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-light hover:text-white transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Exit Game
            </button>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaClock className="text-gold-primary" />
                  <span className="text-lg font-bold">{timeLeft}s</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaTrophy className="text-gold-primary" />
                  <span className="text-lg font-bold">{score}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-primary to-gold-secondary rounded-lg flex items-center justify-center">
                  <FaGamepad className="text-black-primary text-xl" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gold-primary to-gold-secondary bg-clip-text text-transparent">
                  Yenege
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-light">Round {currentRound} of {totalRounds}</span>
            <span className="text-sm text-gray-light">{Math.round((currentRound / totalRounds) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-dark rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-gold-primary to-gold-secondary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentRound / totalRounds) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={currentPhrase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Emoji Display */}
            <div className="mb-8">
              <div className="inline-block bg-black-secondary rounded-3xl p-8 border border-gray-dark">
                <div className="text-8xl md:text-9xl mb-4">{currentPhrase.emojis}</div>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getDifficultyColor(currentPhrase.difficulty)} bg-gray-dark`}>
                  {getDifficultyLabel(currentPhrase.difficulty)}
                </div>
              </div>
            </div>

            {/* Answer Input */}
            <div className="mb-8">
              <div className="max-w-md mx-auto">
                <label className="block text-sm font-medium text-gray-light mb-2 text-left">
                  What do these emojis represent?
                </label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Type your answer..."
                  disabled={!isGameActive}
                  className="w-full bg-gray-dark border border-gray-medium rounded-lg px-4 py-3 text-white text-center text-lg focus:outline-none focus:border-gold-primary disabled:opacity-50"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleSubmit}
                disabled={!isGameActive || !userAnswer.trim()}
                className="px-8 py-4 bg-gradient-to-r from-gold-primary to-gold-secondary text-black-primary font-bold rounded-xl hover:from-gold-secondary hover:to-gold-primary transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 mx-auto"
              >
                <FaCheck />
                <span>Submit Answer</span>
              </button>
              
              <button
                onClick={() => setShowHint(!showHint)}
                disabled={!isGameActive}
                className="px-6 py-3 bg-gray-dark text-white font-medium rounded-lg hover:bg-gray-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 mx-auto"
              >
                <FaLightbulb />
                <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
              </button>
            </div>

            {/* Hint */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 max-w-md mx-auto"
                >
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm">
                      <strong>Hint:</strong> {currentPhrase.hint}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result Display */}
            <AnimatePresence>
              {isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-8"
                >
                  <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-full ${
                    isCorrect 
                      ? 'bg-green-500/20 border border-green-500/30' 
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}>
                    {isCorrect ? (
                      <FaCheck className="text-green-400 text-xl" />
                    ) : (
                      <FaTimes className="text-red-400 text-xl" />
                    )}
                    <span className={`font-semibold ${
                      isCorrect ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isCorrect ? 'Correct!' : 'Incorrect!'}
                    </span>
                  </div>
                  
                  {!isCorrect && (
                    <div className="mt-4 text-gray-light">
                      <p>The correct answer was: <span className="font-semibold text-white">{currentPhrase.answer}</span></p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EmojiGame;
