import React from 'react';
import { Link } from 'react-router-dom';

interface WrongGameTypeProps {
  expectedGameType?: string;
}

const WrongGameType: React.FC<WrongGameTypeProps> = ({ expectedGameType }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black-primary to-black-secondary">
      <div className="bg-black-secondary p-8 rounded-lg shadow-md text-center border border-gold-primary/20">
        <h1 className="text-3xl font-bold text-gold-primary mb-4">Wrong Game Card</h1>
        <p className="text-lg text-cream mb-6">
          It looks like you're trying to access a game that doesn't match your current card.
        </p>
        {expectedGameType && (
          <p className="text-md text-gray-light mb-4">
            Your current card is for the <strong>{expectedGameType}</strong> game.
          </p>
        )}
        <p className="text-md text-gray-light mb-6">
          Please ensure you have the correct card for the game you wish to play.
        </p>
        <Link
          to="/game-select"
          className="inline-block bg-gold-primary hover:bg-gold-secondary text-black-primary font-bold py-2 px-4 rounded-full transition duration-300"
        >
          Scan a New Card
        </Link>
      </div>
    </div>
  );
};

export default WrongGameType;
