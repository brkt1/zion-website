import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type Choice = {
    name: string;
    emoji: string;
    color: string;
};

const RockPaperScissors = () => {
    const [userChoice, setUserChoice] = useState<Choice | null>(null);
    const [computerChoice, setComputerChoice] = useState<Choice | null>(null);

    const [showRules, setShowRules] = useState(true);
    const [gameStarted, setGameStarted] = useState(false);

    const [result, setResult] = useState('');
    const [score, setScore] = useState({ user: 0, computer: 0 });

    const choices = useMemo(() => [
        { 
            name: 'Rock', 
            emoji: '🪨', 
            color: 'bg-gradient-to-br from-gray-600 to-gray-800' 
        },
        { 
            name: 'Paper', 
            emoji: '📄', 
            color: 'bg-gradient-to-br from-blue-500 to-blue-700' 
        },
        { 
            name: 'Scissors', 
            emoji: '✂️', 
            color: 'bg-gradient-to-br from-red-500 to-red-700' 
        },
        { 
            name: 'Lizard', 
            emoji: '🦎', 
            color: 'bg-gradient-to-br from-green-500 to-green-700' 
        },
        { 
            name: 'Spock', 
            emoji: '🖖', 
            color: 'bg-gradient-to-br from-purple-500 to-purple-700' 
        }
    ], []);

    const determineWinner = useCallback((user: Choice, computer: Choice) => {
        if (!user || !computer) return 'Invalid choice';

        if (user === computer) return 'Tie';

        const winningCombos: Record<string, string[]> = {
            Rock: ['Scissors', 'Lizard'],
            Paper: ['Rock', 'Spock'],
            Scissors: ['Paper', 'Lizard'],
            Lizard: ['Spock', 'Paper'],
            Spock: ['Scissors', 'Rock']
        };

        return winningCombos[user.name].includes(computer.name) ? 'User' : 'Computer';
    }, []);

    const playGame = useCallback((userSelection: Choice) => {
        const computerSelection = choices[Math.floor(Math.random() * choices.length)];
        
        setUserChoice(userSelection);
        setComputerChoice(computerSelection);

        const gameResult = determineWinner(userSelection, computerSelection);
        
        setResult(gameResult === 'Tie' ? "It's a tie!" : `${gameResult} wins!`);
        
        if (gameResult === 'User') {
            setScore(prev => ({ ...prev, user: prev.user + 1 }));
        } else if (gameResult === 'Computer') {
            setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
        }
    }, [choices, determineWinner]);

    const RulesModal = () => {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-800 rounded-2xl p-8 max-w-md w-full space-y-6"
                >
                    <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                        Rock Paper Scissors Lizard Spock
                    </h2>

                    <div className="space-y-4 text-gray-300">
                        <h3 className="text-xl font-semibold text-white">Game Rules:</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Rock crushes Scissors</li>
                            <li>Scissors cuts Paper</li>
                            <li>Paper covers Rock</li>
                            <li>Rock crushes Lizard</li>
                            <li>Lizard poisons Spock</li>
                            <li>Spock smashes Scissors</li>
                            <li>Scissors decapitates Lizard</li>
                            <li>Lizard eats Paper</li>
                            <li>Paper disproves Spock</li>
                            <li>Spock vaporizes Rock</li>
                        </ul>
                    </div>

                    <div className="text-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setShowRules(false);
                                setGameStarted(true);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 
                                       text-white px-6 py-3 rounded-xl 
                                       font-bold text-lg"
                        >
                            Start Game
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    };

    // If rules are showing, render the rules modal
    if (showRules) {
        return <RulesModal />;
    }

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 
                        bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] 
                        from-gray-900 via-gray-900 to-black">
            <div className="w-full max-w-md bg-gray-800/60 backdrop-blur-xl 
                            rounded-3xl border border-gray-700/50 
                            shadow-2xl p-8 space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold bg-clip-text 
                                   text-transparent bg-gradient-to-r 
                                   from-blue-500 to-purple-600 mb-4">
                        Rock Paper Scissors
                    </h1>
                    <p className="text-gray-400 text-sm">Challenge the computer!</p>
                </div>

                {/* Choice Selection */}
                <div className="grid grid-cols-3 gap-4">
                    {choices.map(choice => (
                        <motion.button
                            key={choice.name}
                            onClick={() => playGame(choice)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative overflow-hidden rounded-2xl 
                                       ${choice.color} 
                                       flex flex-col items-center justify-center 
                                       p-4 group transition-all duration-300
                                       hover:shadow-xl hover:shadow-blue-500/30`}
                        >
                            {/* Glowing effect */}
                            <div className="absolute inset-0 bg-white/10 
                                            opacity-0 group-hover:opacity-20 
                                            transition-opacity"></div>
                            
                            <span className="text-6xl mb-2 opacity-90">{choice.emoji}</span>
                            <span className="text-sm font-medium text-white/80">
                                {choice.name}
                            </span>
                        </motion.button>
                    ))}
                </div>

                {/* Game Result Area */}
                <AnimatePresence>
                    {userChoice && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mt-6 text-center text-gray-300"
                        >
                            <h2 className="text-2xl font-bold">{result}</h2>
                            <div className="flex justify-center space-x-4 mt-4">
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl">{userChoice.emoji}</span>
                                    <span className="text-sm text-white">{userChoice.name}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl">{computerChoice?.emoji}</span>
                                    <span className="text-sm text-white">{computerChoice?.name}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Score Display */}
                <div className="text-center text-gray-400">
                    <h3 className="text-lg font-semibold">Score</h3>
                    <p>User: {score.user} - Computer: {score.computer}</p>
                </div>
            </div>
        </div>
    );
};

export default RockPaperScissors;
