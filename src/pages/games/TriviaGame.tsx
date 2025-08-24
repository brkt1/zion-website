import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaBrain,
    FaCheck,
    FaClock,
    FaGamepad,
    FaRedo,
    FaTimes,
    FaTrophy
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';

interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  explanation?: string;
}

const TriviaGame: React.FC = () => {
  const { currentSession, endGame } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(15);
  const [gameHistory, setGameHistory] = useState<Array<{ question: TriviaQuestion; selectedAnswer: string; isCorrect: boolean; timeSpent: number }>>([]);
  const [showResults, setShowResults] = useState(false);
  const [streak, setStreak] = useState(0);

  // Sample trivia questions - in production, these would come from an API
  const triviaQuestions: TriviaQuestion[] = [
    {
      id: '1',
      question: 'What is the capital of Ethiopia?',
      options: ['Addis Ababa', 'Nairobi', 'Khartoum', 'Cairo'],
      correctAnswer: 'Addis Ababa',
      category: 'Geography',
      difficulty: 'easy',
      timeLimit: 30
    },
    {
      id: '2',
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 'Mars',
      category: 'Science',
      difficulty: 'easy',
      timeLimit: 25
    },
    {
      id: '3',
      question: 'What year did World War II end?',
      options: ['1943', '1944', '1945', '1946'],
      correctAnswer: '1945',
      category: 'History',
      difficulty: 'medium',
      timeLimit: 30
    },
    {
      id: '4',
      question: 'Who painted the Mona Lisa?',
      options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
      correctAnswer: 'Leonardo da Vinci',
      category: 'Art',
      difficulty: 'medium',
      timeLimit: 30
    },
    {
      id: '5',
      question: 'What is the chemical symbol for gold?',
      options: ['Ag', 'Au', 'Fe', 'Cu'],
      correctAnswer: 'Au',
      category: 'Science',
      difficulty: 'medium',
      timeLimit: 25
    },
    {
      id: '6',
      question: 'Which country is home to the kangaroo?',
      options: ['New Zealand', 'South Africa', 'Australia', 'India'],
      correctAnswer: 'Australia',
      category: 'Geography',
      difficulty: 'easy',
      timeLimit: 20
    },
    {
      id: '7',
      question: 'What is the largest ocean on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correctAnswer: 'Pacific Ocean',
      category: 'Geography',
      difficulty: 'easy',
      timeLimit: 20
    },
    {
      id: '8',
      question: 'Who wrote "Romeo and Juliet"?',
      options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
      correctAnswer: 'William Shakespeare',
      category: 'Literature',
      difficulty: 'medium',
      timeLimit: 30
    },
    {
      id: '9',
      question: 'What is the square root of 144?',
      options: ['10', '11', '12', '13'],
      correctAnswer: '12',
      category: 'Mathematics',
      difficulty: 'easy',
      timeLimit: 20
    },
    {
      id: '10',
      question: 'Which element has the atomic number 1?',
      options: ['Helium', 'Hydrogen', 'Lithium', 'Carbon'],
      correctAnswer: 'Hydrogen',
      category: 'Science',
      difficulty: 'medium',
      timeLimit: 25
    },
    {
      id: '11',
      question: 'What is the largest mammal in the world?',
      options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'],
      correctAnswer: 'Blue Whale',
      category: 'Science',
      difficulty: 'medium',
      timeLimit: 25
    },
    {
      id: '12',
      question: 'In which year did the first moon landing occur?',
      options: ['1967', '1968', '1969', '1970'],
      correctAnswer: '1969',
      category: 'History',
      difficulty: 'medium',
      timeLimit: 30
    },
    {
      id: '13',
      question: 'What is the currency of Japan?',
      options: ['Won', 'Yuan', 'Yen', 'Ringgit'],
      correctAnswer: 'Yen',
      category: 'Geography',
      difficulty: 'easy',
      timeLimit: 20
    },
    {
      id: '14',
      question: 'Who is the author of "The Great Gatsby"?',
      options: ['Ernest Hemingway', 'F. Scott Fitzgerald', 'John Steinbeck', 'J.D. Salinger'],
      correctAnswer: 'F. Scott Fitzgerald',
      category: 'Literature',
      difficulty: 'hard',
      timeLimit: 35
    },
    {
      id: '15',
      question: 'What is the speed of light in a vacuum?',
      options: ['299,792 km/s', '199,792 km/s', '399,792 km/s', '499,792 km/s'],
      correctAnswer: '299,792 km/s',
      category: 'Science',
      difficulty: 'hard',
      timeLimit: 40
    }
  ];

  const startNewRound = useCallback(() => {
    if (currentRound > totalRounds) {
      endGameSession();
      return;
    }

    const availableQuestions = triviaQuestions.filter(question => 
      !gameHistory.some(history => history.question.id === question.id)
    );

    if (availableQuestions.length === 0) {
      // Reset if all questions used
      setGameHistory([]);
      setCurrentRound(1);
      setScore(0);
      setStreak(0);
    }

    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setTimeLeft(randomQuestion.timeLimit);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setIsGameActive(true);
  }, [currentRound, totalRounds, gameHistory, triviaQuestions]);

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
    setStreak(0);
    const roundResult = {
      question: currentQuestion!,
      selectedAnswer: 'No answer',
      isCorrect: false,
      timeSpent: currentQuestion!.timeLimit
    };
    setGameHistory(prev => [...prev, roundResult]);
    
    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
    }, 3000);
  };

  const handleAnswerSelect = (answer: string) => {
    if (!isGameActive || selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    const isAnswerCorrect = answer === currentQuestion!.correctAnswer;
    setIsCorrect(isAnswerCorrect);
    setIsGameActive(false);

    if (isAnswerCorrect) {
      const timeBonus = Math.max(0, timeLeft);
      const difficultyMultiplier = currentQuestion!.difficulty === 'easy' ? 1 : currentQuestion!.difficulty === 'medium' ? 1.5 : 2;
      const streakBonus = Math.min(streak * 10, 50); // Max 50 bonus points for streak
      const roundScore = Math.round((currentQuestion!.timeLimit - timeLeft + timeBonus) * difficultyMultiplier + streakBonus);
      
      setScore(prev => prev + roundScore);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    const roundResult = {
      question: currentQuestion!,
      selectedAnswer: answer,
      isCorrect: isAnswerCorrect,
      timeSpent: currentQuestion!.timeLimit - timeLeft
    };
    setGameHistory(prev => [...prev, roundResult]);

    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
    }, 3000);
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
    setStreak(0);
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
          
          <h1 className="text-3xl font-bold mb-4">Trivia Complete!</h1>
          
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

            <div className="bg-gray-dark rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {Math.max(...gameHistory.map(r => r.timeSpent))}s
              </div>
              <div className="text-sm text-gray-light">Fastest Answer</div>
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

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-black-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-light">Loading question...</p>
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

                <div className="flex items-center space-x-2">
                  <FaBrain className="text-purple-400" />
                  <span className="text-lg font-bold">{streak}</span>
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
            <span className="text-sm text-gray-light">Question {currentRound} of {totalRounds}</span>
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
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Question Header */}
            <div className="mb-8">
              <div className="inline-flex items-center space-x-3 bg-black-secondary px-6 py-3 rounded-full border border-gray-dark mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)} bg-gray-dark`}>
                  {getDifficultyLabel(currentQuestion.difficulty)}
                </span>
                <span className="text-gray-light">•</span>
                <span className="text-gray-light">{currentQuestion.category}</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                    whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={selectedAnswer !== null || !isGameActive}
                    className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                      selectedAnswer === null
                        ? 'bg-black-secondary border-gray-dark hover:border-gold-primary hover:bg-gray-dark/50'
                        : selectedAnswer === option
                        ? isCorrect
                          ? 'bg-green-500/20 border-green-500'
                          : 'bg-red-500/20 border-red-500'
                        : option === currentQuestion.correctAnswer
                        ? 'bg-green-500/20 border-green-500'
                        : 'bg-gray-dark/50 border-gray-dark opacity-50'
                    } ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedAnswer === null
                          ? 'bg-gray-dark text-gray-light'
                          : selectedAnswer === option
                          ? isCorrect
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          : option === currentQuestion.correctAnswer
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-dark text-gray-light'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-lg">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Result Display */}
            <AnimatePresence>
              {isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-8"
                >
                  <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-full mb-4 ${
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
                    <div className="text-gray-light mb-4">
                      <p>The correct answer was: <span className="font-semibold text-white">{currentQuestion.correctAnswer}</span></p>
                    </div>
                  )}

                  {/* Explanation */}
                  {currentQuestion.explanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="max-w-2xl mx-auto"
                    >
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-blue-400 text-sm">
                          <strong>Explanation:</strong> {currentQuestion.explanation}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Next Question Countdown */}
                  <div className="mt-6">
                    <div className="text-gray-light">
                      Next question in <span className="text-gold-primary font-bold">3</span> seconds...
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TriviaGame;
