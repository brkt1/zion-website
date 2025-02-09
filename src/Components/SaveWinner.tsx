import React, { useState } from 'react';
import { storage } from '../utils/storage';
import { security } from '../utils/security';

interface SaveWinnerProps {
  winner: string;
  onSave: (name: string) => void;
}

const SaveWinner: React.FC<SaveWinnerProps> = ({ winner, onSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Sanitize input
    const sanitizedName = security.sanitizeInput(name);
    if (!sanitizedName) {
      setError('Please enter a valid name');
      return;
    }

    // Get existing winners with validation
    const winners = storage.getWinners();
    
    // Add new winner
    const updatedWinners = [
      ...winners,
      { 
        name: sanitizedName,
        date: new Date().toISOString()
      }
    ];

    // Save with validation
    if (storage.setWinners(updatedWinners)) {
      onSave(sanitizedName);
    } else {
      setError('Failed to save winner. Please try again.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Save Winner</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter winner's name"
          className="border p-2 mr-2"
          maxLength={50}
          aria-label="Winner name"
        />
        <button 
          type="submit" 
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={!name.trim()}
        >
          Save
        </button>
        {error && (
          <div className="text-red-500 mt-2" role="alert">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default SaveWinner;
