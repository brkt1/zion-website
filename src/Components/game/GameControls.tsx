import { LightBulbIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';

export const GameControls = ({
  feedback,
  showHint,
  hintString,
  guess,
  onGuessChange,
  onGuessSubmit,
  onHint,
  hintCount,
  onSkip,
}: {
  feedback: string | null;
  showHint: boolean;
  hintString: string;
  guess: string;
  onGuessChange: (value: string) => void;
  onGuessSubmit: () => void;
  onHint: () => void;
  hintCount: number;
  onSkip: () => void;
}) => {
  // Ensure guess is always a string
  const safeGuess = typeof guess === 'string' ? guess : String(guess || '');
  
  return (
    <div className="space-y-6">
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`px-6 py-3 rounded-xl text-center border ${
              feedback.includes('Correct')
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {showHint && (
          <div className="bg-white/10 px-4 py-2 rounded-lg text-sm border border-white/20">
            Hint: {hintString}
          </div>
        )}
        <input
          value={safeGuess}
          onChange={(e) => onGuessChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onGuessSubmit()}
          placeholder="Type your answer..."
          className="w-full px-4 py-3 bg-white/5 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-white/40"
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onHint}
            disabled={showHint || hintCount === 0}
            className="py-2.5 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-40 rounded-xl flex items-center justify-center gap-1"
          >
            <LightBulbIcon className="w-4 h-4" />
            Hint ({hintCount})
          </button>
          <button
            onClick={onSkip}
            className="py-2.5 text-sm bg-white/5 hover:bg-white/10 rounded-xl"
          >
            Skip ➔
          </button>
        </div>

        <button
          onClick={onGuessSubmit}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl text-sm font-semibold"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
};