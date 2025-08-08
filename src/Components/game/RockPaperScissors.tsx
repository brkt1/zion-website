import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useSessionStore } from "../../stores/sessionStore";
import { GameSessionGuard } from "./GameSessionGuard";

const choices = ["rock", "paper", "scissors"];

const RockPaperScissors = () => {
  const navigate = useNavigate();
  const { startSession } = useSessionStore();

  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [playerChoice, setPlayerChoice] = useState("");
  const [computerChoice, setComputerChoice] = useState("");
  const [result, setResult] = useState("");
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const maxRounds = 5;

  useEffect(() => {
    if (roundsPlayed === maxRounds) {
      setGameOver(true);
      // Navigate to results page
      navigate("/game-result", {
        state: {
          sessionId: sessionId,
          playerId: playerId,
          playerName: playerName,
          gameType: "Rock Paper Scissors",
          score: playerScore, // Or a more complex score based on wins/losses
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [
    roundsPlayed,
    gameOver,
    navigate,
    playerId,
    playerName,
    playerScore,
    sessionId,
  ]);

  const startGame = () => {
    const newPlayerId = uuidv4();
    const newSessionId = uuidv4();
    setPlayerId(newPlayerId);
    setSessionId(newSessionId);
    setPlayerScore(0);
    setComputerScore(0);
    setRoundsPlayed(0);
    setGameOver(false);
    setPlayerChoice("");
    setComputerChoice("");
    setResult("");
    startSession("ROCK_PAPER_SCISSORS", newPlayerId, 300); // Example duration
  };

  const playRound = (choice: string) => {
    if (gameOver) return;

    const computerRandomChoice =
      choices[Math.floor(Math.random() * choices.length)];
    setPlayerChoice(choice);
    setComputerChoice(computerRandomChoice);

    let roundResult = "";
    if (choice === computerRandomChoice) {
      roundResult = "It's a tie!";
    } else if (
      (choice === "rock" && computerRandomChoice === "scissors") ||
      (choice === "paper" && computerRandomChoice === "rock") ||
      (choice === "scissors" && computerRandomChoice === "paper")
    ) {
      roundResult = "You win!";
      setPlayerScore((prev) => prev + 1);
    } else {
      roundResult = "Computer wins!";
      setComputerScore((prev) => prev + 1);
    }
    setResult(roundResult);
    setRoundsPlayed((prev) => prev + 1);
  };

  if (!playerName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="p-8 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Enter Your Name</h2>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-700 text-white mb-4"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your Name"
          />
          <button
            onClick={startGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <GameSessionGuard>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <h1 className="text-4xl font-bold mb-8">Rock Paper Scissors</h1>
        {!gameOver ? (
          <div className="flex space-x-4 mb-8">
            {choices.map((choice) => (
              <button
                key={choice}
                onClick={() => playRound(choice)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg capitalize"
              >
                {choice}
              </button>
            ))}
          </div>
        ) : (
          <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
        )}

        {playerChoice && computerChoice && (
          <div className="text-xl mb-4">
            <p>You chose: {playerChoice}</p>
            <p>Computer chose: {computerChoice}</p>
            <p>{result}</p>
          </div>
        )}

        <div className="text-2xl mb-4">
          Score: You {playerScore} - {computerScore} Computer
        </div>
        <div className="text-lg mb-8">
          Rounds Played: {roundsPlayed} / {maxRounds}
        </div>

        {gameOver && (
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Home
          </button>
        )}
      </div>
    </GameSessionGuard>
  );
};

export default RockPaperScissors;
