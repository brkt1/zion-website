import React from "react";

interface IntroScreenProps {
  playerName: string;
  googleName: string;
  onNameChange: (val: string) => void;
  onStart: () => void;
  isLoading: boolean;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  playerName,
  googleName,
  onNameChange,
  onStart,
  isLoading,
}) => (
  <div className="intro-screen flex flex-col items-center space-y-4">
    <h2 className="text-2xl font-bold">Welcome to Emoji Game!</h2>
    <input
      type="text"
      value={playerName}
      onChange={(e) => onNameChange(e.target.value)}
      className="input-name p-2 rounded"
      placeholder={googleName || "Enter your name..."}
    />
    <button
      onClick={onStart}
      className="btn-start bg-green-500 text-white px-4 py-2 rounded"
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : "Start Game"}
    </button>
  </div>
);
