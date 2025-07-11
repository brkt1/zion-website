import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabaseClient'; // Ensure supabase is imported
import { security } from '../utils/security'; // Ensure security is imported

interface PlayerIdGeneratorProps {
  onGenerate: (id: string) => void;
}

const PlayerIdGenerator: React.FC<PlayerIdGeneratorProps> = ({ onGenerate }) => {
  const [playerId, setPlayerId] = useState('');
  const [name, setName] = useState(''); // State for player name
  const [error, setError] = useState<string | null>(null); // State for error handling

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
    console.log('Generated player ID:', playerId); // Log the generated player ID

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

      
      onGenerate(playerId); // Pass the generated ID to the parent component
    } catch (err) {
      console.error('Error saving winner:', err); // Log error details
      setError('An error occurred while saving the winner. Please try again.'); // Set user-friendly error message
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter your name" 
          required 
        />
        <button type="submit">Generate Player ID</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
      <p>Generated Player ID: {playerId}</p>
    </div>
  );
};

export default PlayerIdGenerator;
