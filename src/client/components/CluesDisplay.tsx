import { motion } from "framer-motion";

interface CluesDisplayProps {
  clues: string[];
}

export function CluesDisplay({ clues }: CluesDisplayProps) {
  if (!clues.length) return null;
  
  return (
    <div className="mb-3">
      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, staggerChildren: 0.05 }}
      >
        {clues.map((clue, i) => (
          <motion.span
            key={i}
            className="clue-pill"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            💡 {clue}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}