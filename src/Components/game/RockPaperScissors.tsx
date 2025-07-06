import React from 'react';
import { GameSessionGuard } from './GameSessionGuard';

const RockPaperScissors = () => {
  return (
    <GameSessionGuard>
      <div>
        <h1>Rock Paper Scissors Game</h1>
        {/* Game logic goes here */}
      </div>
    </GameSessionGuard>
  );
};

export default RockPaperScissors;
