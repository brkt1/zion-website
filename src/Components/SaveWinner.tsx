import React, { useState } from 'react';
import { storage } from '../utils/storage';
import { security } from '../utils/security';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabaseClient';

interface SaveWinnerProps {
  winner: string;
  onSave: (name: string, playerId: string) => void;
}

const SaveWinner: React.FC<SaveWinnerProps> = ({ winner, onSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Sanitize input
    const sanitizedName = security.sanitizeInput(name);
    if (!sanitizedName) {
      setError('Please enter a valid name');
      return;
    }

    // Generate playerId
    const playerId = uuidv4();

    try {
      // Get user session if available
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;

      // Save winner to Supabase
      const { error: saveError } = await supabase
        .from("winners")
        .insert({
          player_name: sanitizedName,
          player_id: playerId,
          game_type: "trivia",
          ...(session?.user?.id ? { user_id: session.user.id } : {})
        });

      if (saveError) throw saveError;

      // Get existing winners with validation
      const winners = storage.getWinners();
      
      // Add new winner
      const updatedWinners = [
        ...winners,
        { 
          name: sanitizedName,
          playerId: playerId,
          date: new Date().toISOString()
        }
      ];

      // Save with validation
      if (storage.setWinners(updatedWinners)) {
        onSave(sanitizedName, playerId);
      } else {
        setError('Failed to save winner. Please try again.');
      }
    } catch (err) {
      setError('Failed to save winner: ' + (err as Error).message);
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
