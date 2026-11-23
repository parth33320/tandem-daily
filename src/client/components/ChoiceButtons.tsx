import { motion, Variants, Transition } from "framer-motion";
import type { RoundContent } from "../../shared/game/content";

interface ChoiceButtonsProps {
  card: RoundContent;
  direction: "zh2ja" | "ja2zh" | "en";
  eliminatedIndices: number[];
  onSelect: (idx: number) => void;
  disabled: boolean;
  stats?: { [choice: string]: number } | undefined;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.08 } as Transition
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, rotate: -12, y: 30, scale: 0.9 },
  visible: { 
    opacity: 1, 
    rotate: 0, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 }
  },
};

export function ChoiceButtons({ card, direction, eliminatedIndices, onSelect, disabled, stats }: ChoiceButtonsProps) {
  const displayDir = direction === "en" ? "zh2ja" : direction;
  const optionSet = displayDir === "ja2zh" ? card.zh : { options: card.options, correct: card.correct, drop: card.drop };
  const total = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0;

  return (
    <motion.div
      className="flex items-end justify-center gap-1.5 sm:gap-2 mt-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {optionSet.options.map((option, idx) => {
        const isEliminated = eliminatedIndices.includes(idx);
        const pct = stats && total > 0 ? Math.round((stats[idx.toString()] || 0) / total * 100) : null;
        
        return (
          <motion.button
            key={idx}
            className={`paper-card relative w-20 sm:w-24 h-28 sm:h-36 rounded-xl flex flex-col items-center justify-center p-3 text-center transition-all
              ${isEliminated ? 'choice-card-eliminated opacity-25 line-through' : 'choice-card'}
            `}
            variants={itemVariants}
            onClick={() => !isEliminated && !disabled && onSelect(idx)}
            disabled={isEliminated || disabled}
            data-testid={`answer-option-${idx}`}
          >
            {/* Corner index A/B/C/D */}
            <span className="corner-index">
              {String.fromCharCode(65 + idx)}
            </span>
            
            {/* Option text */}
            <span className="font-sans text-sm sm:text-base leading-snug text-paper-ink">{option}</span>
            
            {/* Vote percentage for community stats */}
            {pct !== null && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 stat-pill gold text-[10px] px-1.5 py-0.5">
                {pct}%
              </span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}