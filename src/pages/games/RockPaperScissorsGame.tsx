import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FaArrowLeft,
    FaCrown,
    FaGamepad,
    FaHandPaper,
    FaHandRock,
    FaHandScissors,
    FaRedo,
    FaTrophy,
    FaUsers
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';

interface GameResult {
    playerChoice: string;
    computerChoice: string;
    result: 'win' | 'lose' | 'draw';
    points: number;
    streak: number;
}

const RockPaperScissorsGame: React.FC = () => {
    const { currentSession, endGame } = useGame();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [playerChoice, setPlayerChoice] = useState<string | null>(null);
    const [computerChoice, setComputerChoice] = useState<string | null>(null);
    const [gameResult, setGameResult] = useState<GameResult | null>(null);
    const [isGameActive, setIsGameActive] = useState(false);
    const [score, setScore] = useState(0);
    const [currentRound, setCurrentRound] = useState(1);
    const [totalRounds] = useState(10);
    const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [streak, setStreak] = useState(0);
    const [showChoice, setShowChoice] = useState(false);

    const choices = [
        { value: 'rock', icon: FaHandRock, label: 'Rock', beats: 'scissors', color: 'from-gray-500 to-gray-700' },
        { value: 'paper', icon: FaHandPaper, label: 'Paper', beats: 'rock', color: 'from-blue-500 to-blue-700' },
        { value: 'scissors', icon: FaHandScissors, label: 'Scissors', beats: 'paper', color: 'from-green-500 to-green-700' }
    ];

    const startNewRound = useCallback(() => {
        if (currentRound > totalRounds) {
            endGameSession();
            return;
        }

        setPlayerChoice(null);
        setComputerChoice(null);
        setGameResult(null);
        setShowChoice(false);
        setIsGameActive(true);
    }, [currentRound, totalRounds]);

    useEffect(() => {
        startNewRound();
    }, [startNewRound]);

    const handleChoice = (choice: string) => {
        if (!isGameActive) return;

        setPlayerChoice(choice);
        setIsGameActive(false);

        // Simulate computer thinking
        setTimeout(() => {
            const computerChoice = choices[Math.floor(Math.random() * choices.length)].value;
            setComputerChoice(computerChoice);
            setShowChoice(true);

            // Calculate result
            const result = calculateResult(choice, computerChoice);
            const points = calculatePoints(result, streak);
            const newStreak = result === 'win' ? streak + 1 : 0;

            const roundResult: GameResult = {
                playerChoice: choice,
                computerChoice: computerChoice,
                result: result,
                points: points,
                streak: newStreak
            };

            setGameResult(roundResult);
            setStreak(newStreak);
            setScore(prev => prev + points);
            setGameHistory(prev => [...prev, roundResult]);

            // Auto-advance to next round
            setTimeout(() => {
                setCurrentRound(prev => prev + 1);
            }, 3000);
        }, 1000);
    };

    const calculateResult = (player: string, computer: string): 'win' | 'lose' | 'draw' => {
        if (player === computer) return 'draw';
        
        const playerChoice = choices.find(c => c.value === player);
        if (playerChoice?.beats === computer) return 'win';
        return 'lose';
    };

    const calculatePoints = (result: string, currentStreak: number): number => {
        const basePoints = 50;
        const streakBonus = Math.min(currentStreak * 10, 50); // Max 50 bonus points

        switch (result) {
            case 'win':
                return basePoints + streakBonus;
            case 'draw':
                return Math.floor(basePoints / 2);
            case 'lose':
                return 0;
            default:
                return 0;
        }
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

    const getResultColor = (result: string) => {
        switch (result) {
            case 'win': return 'text-green-400';
            case 'lose': return 'text-red-400';
            case 'draw': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    const getResultLabel = (result: string) => {
        switch (result) {
            case 'win': return 'You Win!';
            case 'lose': return 'You Lose!';
            case 'draw': return 'It\'s a Draw!';
            default: return 'Unknown';
        }
    };

    const getChoiceIcon = (choice: string) => {
        const choiceObj = choices.find(c => c.value === choice);
        return choiceObj ? choiceObj.icon : FaHandRock;
    };

    const getChoiceColor = (choice: string) => {
        const choiceObj = choices.find(c => c.value === choice);
        return choiceObj ? choiceObj.color : 'from-gray-500 to-gray-700';
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

                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="bg-gray-dark rounded-lg p-4">
                                <div className="text-2xl font-bold text-green-400">
                                    {gameHistory.filter(r => r.result === 'win').length}
                                </div>
                                <div className="text-sm text-gray-light">Wins</div>
                            </div>

                            <div className="bg-gray-dark rounded-lg p-4">
                                <div className="text-2xl font-bold text-yellow-400">
                                    {gameHistory.filter(r => r.result === 'draw').length}
                                </div>
                                <div className="text-sm text-gray-light">Draws</div>
                            </div>

                            <div className="bg-gray-dark rounded-lg p-4">
                                <div className="text-2xl font-bold text-red-400">
                                    {gameHistory.filter(r => r.result === 'lose').length}
                                </div>
                                <div className="text-sm text-gray-light">Losses</div>
                            </div>
                        </div>

                        <div className="bg-gray-dark rounded-lg p-4">
                            <div className="text-2xl font-bold text-purple-400">
                                {Math.max(...gameHistory.map(r => r.streak))}
                            </div>
                            <div className="text-sm text-gray-light">Best Streak</div>
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
                                    <FaUsers className="text-gold-primary" />
                                    <span className="text-lg font-bold">Round {currentRound}/{totalRounds}</span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <FaTrophy className="text-gold-primary" />
                                    <span className="text-lg font-bold">{score}</span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <FaCrown className="text-purple-400" />
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
                        <span className="text-sm text-gray-light">Progress</span>
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                    >
                        {/* Game Header */}
                        <div className="mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">Rock Paper Scissors</h1>
                            <p className="text-xl text-gray-light">
                                Choose your weapon and beat the computer!
                            </p>
                        </div>

                        {/* Choice Display */}
                        {showChoice && gameResult && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-12"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                                    {/* Player Choice */}
                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold mb-4 text-blue-400">Your Choice</h3>
                                        <div className={`inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br ${getChoiceColor(gameResult.playerChoice)} rounded-full mb-4`}>
                                            {React.createElement(getChoiceIcon(gameResult.playerChoice), { className: "text-white text-6xl" })}
                                        </div>
                                        <p className="text-lg font-medium capitalize">{gameResult.playerChoice}</p>
                                    </div>

                                    {/* Computer Choice */}
                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold mb-4 text-red-400">Computer Choice</h3>
                                        <div className={`inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br ${getChoiceColor(gameResult.computerChoice)} rounded-full mb-4`}>
                                            {React.createElement(getChoiceIcon(gameResult.computerChoice), { className: "text-white text-6xl" })}
                                        </div>
                                        <p className="text-lg font-medium capitalize">{gameResult.computerChoice}</p>
                                    </div>
                                </div>

                                {/* Result Display */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8"
                                >
                                    <div className={`inline-flex items-center space-x-3 px-8 py-4 rounded-full mb-4 ${
                                        gameResult.result === 'win'
                                            ? 'bg-green-500/20 border border-green-500/30'
                                            : gameResult.result === 'lose'
                                            ? 'bg-red-500/20 border border-red-500/30'
                                            : 'bg-yellow-500/20 border border-yellow-500/30'
                                    }`}>
                                        <span className={`text-2xl font-bold ${getResultColor(gameResult.result)}`}>
                                            {getResultLabel(gameResult.result)}
                                        </span>
                                    </div>

                                    {gameResult.points > 0 && (
                                        <div className="text-green-400 mb-4">
                                            <p className="text-lg">+{gameResult.points} points earned!</p>
                                            {gameResult.streak > 1 && (
                                                <p className="text-sm">Streak bonus: +{gameResult.streak * 10} points</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Next Round Countdown */}
                                    <div className="mt-6">
                                        <div className="text-gray-light">
                                            Next round in <span className="text-gold-primary font-bold">3</span> seconds...
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Choice Selection */}
                        {isGameActive && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8"
                            >
                                <h2 className="text-2xl font-bold mb-8">Choose Your Weapon</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                                    {choices.map((choice, index) => (
                                        <motion.button
                                            key={choice.value}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleChoice(choice.value)}
                                            className={`p-8 rounded-2xl border-2 transition-all duration-200 ${
                                                playerChoice === choice.value
                                                    ? 'border-gold-primary bg-gold-primary/20'
                                                    : 'border-gray-dark hover:border-gold-primary hover:bg-gray-dark/50'
                                            }`}
                                        >
                                            <div className={`w-24 h-24 bg-gradient-to-br ${choice.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                                <choice.icon className="text-white text-5xl" />
                                            </div>
                                            <h3 className="text-xl font-bold">{choice.label}</h3>
                                            <p className="text-sm text-gray-light mt-2">
                                                Beats {choice.beats}
                                            </p>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Game Stats */}
                        <div className="mt-12">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                                <div className="bg-black-secondary rounded-lg p-4 border border-gray-dark">
                                    <div className="text-2xl font-bold text-green-400">
                                        {gameHistory.filter(r => r.result === 'win').length}
                                    </div>
                                    <div className="text-sm text-gray-light">Wins</div>
                                </div>

                                <div className="bg-black-secondary rounded-lg p-4 border border-gray-dark">
                                    <div className="text-2xl font-bold text-yellow-400">
                                        {gameHistory.filter(r => r.result === 'draw').length}
                                    </div>
                                    <div className="text-sm text-gray-light">Draws</div>
                                </div>

                                <div className="bg-black-secondary rounded-lg p-4 border border-gray-dark">
                                    <div className="text-2xl font-bold text-red-400">
                                        {gameHistory.filter(r => r.result === 'lose').length}
                                    </div>
                                    <div className="text-sm text-gray-light">Losses</div>
                                </div>

                                <div className="bg-black-secondary rounded-lg p-4 border border-gray-dark">
                                    <div className="text-2xl font-bold text-purple-400">
                                        {streak}
                                    </div>
                                    <div className="text-sm text-gray-light">Current Streak</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default RockPaperScissorsGame;
