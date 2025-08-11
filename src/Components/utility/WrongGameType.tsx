import React from "react";
import { Link, useLocation } from "react-router-dom";

const WrongGameType: React.FC = () => {
  const location = useLocation();
  // All debug info passed in navigation state
  const {
    expectedGameType,
    currentGameTypeId,
    currentGameTypeName,
    currentRoute,
    isActive,
    isTimerActive,
  } = location.state || {};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black-primary to-black-secondary">
      <div className="bg-black-secondary p-8 rounded-lg shadow-md text-center border border-gold-primary/20">
        <h1 className="text-3xl font-bold text-gold-primary mb-4">
          Wrong Game Card
        </h1>
        <p className="text-lg text-cream mb-6">
          It looks like you're trying to access a game that doesn't match your
          current card.
        </p>
        <div className="mb-4 text-left text-sm text-gray-light bg-black-primary/30 p-4 rounded">
          <div className="mb-2 font-bold text-gold-primary">Debug Info:</div>
          <div>
            <strong>Current Route:</strong> {currentRoute || "N/A"}
          </div>
          <div>
            <strong>Expected Game Type:</strong> {expectedGameType || "N/A"}
          </div>
          <div>
            <strong>Current Game Type Name:</strong>{" "}
            {currentGameTypeName || "N/A"}
          </div>
          <div>
            <strong>Current Game Type ID:</strong> {currentGameTypeId || "N/A"}
          </div>
          <div>
            <strong>Session Active:</strong> {String(isActive)}
          </div>
          <div>
            <strong>Timer Active:</strong> {String(isTimerActive)}
          </div>
        </div>
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
