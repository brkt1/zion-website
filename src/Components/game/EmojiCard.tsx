import { motion } from 'framer-motion';

export const EmojiCard = ({ emoji }: { emoji: string }) => (
  <motion.div
    className="bg-white/5 p-6 rounded-xl border border-white/10 flex items-center justify-center"
    key={emoji}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <span className="text-6xl sm:text-8xl">{emoji}</span>
  </motion.div>
);