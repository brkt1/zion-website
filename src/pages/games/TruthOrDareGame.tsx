import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaCheck,
    FaClock,
    FaGamepad,
    FaHeart,
    FaRedo,
    FaTimes,
    FaTrophy,
    FaUsers
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';

interface TruthOrDareChallenge {
    id: string;
    type: 'truth' | 'dare';
    mode: 'lovers' | 'friends';
    challenge: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit: number;
    points: number;
}

const TruthOrDareGame: React.FC = () => {
    const { currentSession, endGame } = useGame();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [selectedMode, setSelectedMode] = useState<'lovers' | 'friends' | null>(null);
    const [currentChallenge, setCurrentChallenge] = useState<TruthOrDareChallenge | null>(null);
    const [challengeType, setChallengeType] = useState<'truth' | 'dare' | null>(null);
    const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isGameActive, setIsGameActive] = useState(false);
    const [score, setScore] = useState(0);
    const [currentRound, setCurrentRound] = useState(1);
    const [totalRounds] = useState(10);
    const [gameHistory, setGameHistory] = useState<Array<{ challenge: TruthOrDareChallenge; completed: boolean; timeSpent: number }>>([]);
    const [showResults, setShowResults] = useState(false);
    const [showModeSelection, setShowModeSelection] = useState(true);

    // Sample challenges - in production, these would come from an API
    const challenges: TruthOrDareChallenge[] = [
        // Lovers Mode - Truth
        {
            id: '1',
            type: 'truth',
            mode: 'lovers',
            challenge: 'What was your first impression of your partner?',
            difficulty: 'easy',
            timeLimit: 30,
            points: 50
        },
        {
            id: '2',
            type: 'truth',
            mode: 'lovers',
            challenge: 'What is your favorite memory together?',
            difficulty: 'easy',
            timeLimit: 30,
            points: 50
        },
        {
            id: '3',
            type: 'truth',
            mode: 'lovers',
            challenge: 'What is one thing you would change about your relationship?',
            difficulty: 'medium',
            timeLimit: 45,
            points: 75
        },
        {
            id: '4',
            type: 'truth',
            mode: 'lovers',
            challenge: 'What is your biggest fear about the future?',
            difficulty: 'hard',
            timeLimit: 60,
            points: 100
        },
        {
            id: '5',
            type: 'truth',
            mode: 'lovers',
            challenge: 'What is one secret you have never told anyone?',
            difficulty: 'hard',
            timeLimit: 60,
            points: 100
        },

        // Lovers Mode - Dare
        {
            id: '6',
            type: 'dare',
            mode: 'lovers',
            challenge: 'Give your partner a 30-second massage',
            difficulty: 'easy',
            timeLimit: 30,
            points: 50
        },
        {
            id: '7',
            type: 'dare',
            mode: 'lovers',
            challenge: 'Dance together for 1 minute',
            difficulty: 'easy',
            timeLimit: 30,
            points: 50
        },
        {
            id: '8',
            type: 'dare',
            mode: 'lovers',
            challenge: 'Share a romantic story about your relationship',
            difficulty: 'medium',
            timeLimit: 45,
            points: 75
        },
        {
            id: '9',
            type: 'dare',
            mode: 'lovers',
            challenge: 'Plan a surprise date for next week',
            difficulty: 'medium',
            timeLimit: 45,
            points: 75
        },
        {
            id: '10',
            type: 'dare',
            mode: 'lovers',
            challenge: 'Write a love letter to your partner',
            difficulty: 'hard',
            timeLimit: 60,
            points: 100
        },

        // Friends Mode - Truth
        {
            id: '11',
            type: 'truth',
            mode: 'friends',
            challenge: 'What is your biggest fear?',
            difficulty: 'easy',
            timeLimit: 30,
            points: 50
        },
        {
            id: '12',
            type: 'truth',
            mode: 'friends',
            challenge: 'What is your most embarrassing moment?',
            difficulty: 'easy',
            timeLimit: 30,
            points: 50
        },
        {
            id: '13',
            type: 'truth',
            mode: 'friends',
            challenge: 'What is one thing you would change about yourself?',
            difficulty: 'medium',
            timeLimit: 45,
            points: 75
        },
        {
            id: '14',
            type: 'truth',
            mode: 'friends',
            challenge: 'What is your biggest regret?',
            difficulty: 'hard',
            timeLimit: 60,
            points: 100
        },
        {
            id: '15',
            type: 'truth',
            mode: 'friends',
            challenge: 'What is one thing you have never told anyone?',
            difficulty: 'hard',
            timeLimit: 60,
            points: 100
        },

        // Friends Mode - Dare
        {
            id: '16',
            type: 'dare',
            mode: 'friends',
            challenge: 'Do your best impression of someone in the room',
            difficulty: 'easy',
            timeLimit: 30,
            points: 50
        },
        {
            id: '17',
            type: 'dare',
            mode: 'friends',
            challenge: 'Sing a song for 30 seconds',
            difficulty: 'easy',
            timeLimit: 30,
            points: 50
        },
        {
            id: '18',
            type: 'dare',
            mode: 'friends',
            challenge: 'Tell a joke and make everyone laugh',
            difficulty: 'medium',
            timeLimit: 45,
            points: 75
        },
        {
            id: '19',
            type: 'dare',
            mode: 'friends',
            challenge: 'Do a 1-minute workout routine',
            difficulty: 'medium',
            timeLimit: 45,
            points: 75
        },
        {
            id: '20',
            type: 'dare',
            mode: 'friends',
            challenge: 'Create a short story using 5 random words',
            difficulty: 'hard',
            timeLimit: 60,
            points: 100
        }
    ];

    const startNewRound = useCallback(() => {
        if (currentRound > totalRounds) {
            endGameSession();
            return;
        }

        const availableChallenges = challenges.filter(challenge => 
            challenge.mode === selectedMode &&
            !gameHistory.some(history => history.challenge.id === challenge.id)
        );

        if (availableChallenges.length === 0) {
            // Reset if all challenges used
            setGameHistory([]);
            setCurrentRound(1);
            setScore(0);
        }

        const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
        setCurrentChallenge(randomChallenge);
        setTimeLeft(randomChallenge.timeLimit);
        setIsCompleted(null);
        setIsGameActive(true);
    }, [currentRound, totalRounds, gameHistory, challenges, selectedMode]);

    useEffect(() => {
        if (selectedMode && !showModeSelection) {
            startNewRound();
        }
    }, [selectedMode, showModeSelection, startNewRound]);

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
        setIsCompleted(false);
        setIsGameActive(false);
        const roundResult = {
            challenge: currentChallenge!,
            completed: false,
            timeSpent: currentChallenge!.timeLimit
        };
        setGameHistory(prev => [...prev, roundResult]);

        setTimeout(() => {
            setCurrentRound(prev => prev + 1);
        }, 3000);
    };

    const handleComplete = () => {
        if (!currentChallenge) return;

        setIsCompleted(true);
        setIsGameActive(false);

        const timeBonus = Math.max(0, timeLeft);
        const difficultyMultiplier = currentChallenge.difficulty === 'easy' ? 1 : currentChallenge.difficulty === 'medium' ? 1.5 : 2;
        const roundScore = Math.round((currentChallenge.points + timeBonus) * difficultyMultiplier);
        
        setScore(prev => prev + roundScore);

        const roundResult = {
            challenge: currentChallenge,
            completed: true,
            timeSpent: currentChallenge.timeLimit - timeLeft
        };
        setGameHistory(prev => [...prev, roundResult]);

        setTimeout(() => {
            setCurrentRound(prev => prev + 1);
        }, 3000);
    };

    const handleSkip = () => {
        if (!currentChallenge) return;

        setIsCompleted(false);
        setIsGameActive(false);

        const roundResult = {
            challenge: currentChallenge,
            completed: false,
            timeSpent: currentChallenge.timeLimit - timeLeft
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
        setGameHistory([]);
        setShowResults(false);
        setShowModeSelection(true);
        setSelectedMode(null);
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

    const getTypeIcon = (type: string) => {
        return type === 'truth' ? '💭' : '🎯';
    };

    const getTypeColor = (type: string) => {
        return type === 'truth' ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500';
    };

    if (showModeSelection) {
        return (
            <div className="min-h-screen bg-black-primary text-white flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black-secondary rounded-2xl p-8 border border-gray-dark max-w-2xl w-full text-center"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaHeart className="text-white text-4xl" />
                    </div>

                    <h1 className="text-3xl font-bold mb-4">Choose Your Mode</h1>

                    <p className="text-gray-light mb-8">
                        Select the mode that best fits your group
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Lovers Mode */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setSelectedMode('lovers');
                                setShowModeSelection(false);
                            }}
                            className="p-6 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl hover:from-pink-600 hover:to-red-600 transition-all duration-200"
                        >
                            <div className="text-4xl mb-3">💕</div>
                            <h3 className="text-xl font-bold mb-2">Lovers Mode</h3>
                            <p className="text-sm opacity-90">
                                Romantic challenges for couples
                            </p>
                        </motion.button>

                        {/* Friends Mode */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setSelectedMode('friends');
                                setShowModeSelection(false);
                            }}
                            className="p-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                        >
                            <div className="text-4xl mb-3">👥</div>
                            <h3 className="text-xl font-bold mb-2">Friends Mode</h3>
                            <p className="text-sm opacity-90">
                                Fun challenges for friends
                            </p>
                        </motion.button>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="mt-8 px-6 py-3 bg-gray-dark text-white font-medium rounded-lg hover:bg-gray-medium transition-colors"
                    >
                        Back to Home
                    </button>
                </motion.div>
            </div>
        );
    }

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
                                    {gameHistory.filter(r => r.completed).length}
                                </div>
                                <div className="text-sm text-gray-light">Completed</div>
                            </div>

                            <div className="bg-gray-dark rounded-lg p-4">
                                <div className="text-2xl font-bold text-white">
                                    {Math.round((gameHistory.filter(r => r.completed).length / gameHistory.length) * 100)}%
                                </div>
                                <div className="text-sm text-gray-light">Success Rate</div>
                            </div>
                        </div>

                        <div className="bg-gray-dark rounded-lg p-4">
                            <div className="text-2xl font-bold text-white">
                                {selectedMode?.charAt(0).toUpperCase()}{selectedMode?.slice(1)} Mode
                            </div>
                            <div className="text-sm text-gray-light">Game Mode</div>
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

    if (!currentChallenge) {
        return (
            <div className="min-h-screen bg-black-primary flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-light">Loading challenge...</p>
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
                                    <FaUsers className="text-purple-400" />
                                    <span className="text-lg font-bold">{selectedMode}</span>
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
                        key={currentChallenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                    >
                        {/* Challenge Header */}
                        <div className="mb-8">
                            <div className="inline-flex items-center space-x-3 bg-black-secondary px-6 py-3 rounded-full border border-gray-dark mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentChallenge.difficulty)} bg-gray-dark`}>
                                    {getDifficultyLabel(currentChallenge.difficulty)}
                                </span>
                                <span className="text-gray-light">•</span>
                                <span className="text-gray-light capitalize">{selectedMode} Mode</span>
                            </div>

                            <div className={`inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br ${getTypeColor(currentChallenge.type)} rounded-full mb-6`}>
                                <span className="text-6xl">{getTypeIcon(currentChallenge.type)}</span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                                {currentChallenge.challenge}
                            </h2>

                            <div className="inline-flex items-center space-x-4 bg-black-secondary px-6 py-3 rounded-full border border-gray-dark">
                                <span className="text-gray-light">Points:</span>
                                <span className="font-semibold text-gold-primary">{currentChallenge.points}</span>
                                <span className="text-gray-light">•</span>
                                <span className="text-gray-light">Time:</span>
                                <span className="font-semibold">{currentChallenge.timeLimit}s</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isGameActive && (
                            <div className="space-y-4 mb-8">
                                <button
                                    onClick={handleComplete}
                                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
                                >
                                    <FaCheck />
                                    <span>Complete Challenge</span>
                                </button>

                                <button
                                    onClick={handleSkip}
                                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
                                >
                                    <FaTimes />
                                    <span>Skip Challenge</span>
                                </button>
                            </div>
                        )}

                        {/* Result Display */}
                        <AnimatePresence>
                            {isCompleted !== null && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="mt-8"
                                >
                                    <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-full mb-4 ${
                                        isCompleted
                                            ? 'bg-green-500/20 border border-green-500/30'
                                            : 'bg-red-500/20 border border-red-500/30'
                                    }`}>
                                        {isCompleted ? (
                                            <FaCheck className="text-green-400 text-xl" />
                                        ) : (
                                            <FaTimes className="text-red-400 text-xl" />
                                        )}
                                        <span className={`font-semibold ${
                                            isCompleted ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            {isCompleted ? 'Challenge Completed!' : 'Challenge Skipped!'}
                                        </span>
                                    </div>

                                    {isCompleted && (
                                        <div className="text-green-400 mb-4">
                                            <p className="text-lg">+{Math.round((currentChallenge.points + Math.max(0, timeLeft)) * (currentChallenge.difficulty === 'easy' ? 1 : currentChallenge.difficulty === 'medium' ? 1.5 : 2))} points earned!</p>
                                        </div>
                                    )}

                                    {/* Next Challenge Countdown */}
                                    <div className="mt-6">
                                        <div className="text-gray-light">
                                            Next challenge in <span className="text-gold-primary font-bold">3</span> seconds...
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

export default TruthOrDareGame;
