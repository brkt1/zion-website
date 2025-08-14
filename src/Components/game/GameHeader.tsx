import React from "react";

interface GameHeaderProps {
  playerName: string;
  score: number;
  remainingTries: number;
  timer: number;
  streak: number;
  currentStage: number;
  stageRequirements: any;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  playerName,
  score,
  remainingTries,
  timer,
  streak,
  currentStage,
  stageRequirements,
}) => (
  <div className="game-header flex flex-col items-center space-y-2">
    <div className="font-bold text-xl">Player: {playerName}</div>
    <div>
      Score: {score} | Tries: {remainingTries} | Timer: {timer}s | Streak:{" "}
      {streak}
    </div>
    <div>Stage: {currentStage}</div>
    {/* Optionally show stage requirements */}
  </div>
);
