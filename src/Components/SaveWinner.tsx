import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

interface SaveWinnerProps {
  playerName: string;
  gameType: 'trivia' | 'emoji';
  score: number;
  onSaved?: (data: any) => void;
}

const SaveWinner: React.FC<SaveWinnerProps> = ({ playerName, gameType, score, onSaved }) => {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const saveWinner = async () => {
    if (!playerName || !gameType || score === undefined) {
      setError('Missing required information');
      return;
    }

    if (parseInt(String(score)) <= 0) {
      setError('Score must be a positive integer');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('winners')
        .insert([
          { 
            player_name: playerName, 
            game_type: gameType, 
            score: parseInt(String(score)) 
          }
        ]);

      if (error) throw error;
      
      onSaved && onSaved(data);
    } catch (err) {
      setError('Error saving winner: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <motion.button
        onClick={saveWinner}
        disabled={saving}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-6 py-3 ${saving 
          ? 'bg-gray-500' 
          : 'bg-gradient-to-r from-pink-500 to-purple-500'} 
          rounded-full text-white font-bold shadow-lg 
          hover:shadow-xl transition-all`}
      >
        {saving ? 'Saving...' : 'Save Score'}
      </motion.button>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-red-500"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default SaveWinner;
