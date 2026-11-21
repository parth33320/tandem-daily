import type { RoundContent } from "@/lib/content";

interface ChoiceButtonsProps {
  card: RoundContent;
  direction: "zh2ja" | "ja2zh";
  eliminated: number[];
  onSelect: (idx: number) => void;
  disabled: boolean;
  stats?: { [choice: string]: number } | undefined;
}

export function ChoiceButtons({ card, direction, eliminated, onSelect, disabled, stats }: ChoiceButtonsProps) {
  const optionSet = direction === "ja2zh" ? card.zh : { options: card.options, correct: card.correct, drop: card.drop };
  const total = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="grid grid-cols-2 gap-2 w-full max-w-md">
      {optionSet.options.map((opt: string, idx: number) => {
        const isEliminated = eliminated.includes(idx);
        const pct = stats && total > 0 ? Math.round((stats[idx.toString()] || 0) / total * 100) : null;
        return (
          <button
            key={idx}
            onClick={() => !disabled && !isEliminated && onSelect(idx)}
            disabled={disabled || isEliminated}
            className={`px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 rounded-lg border-2 transition-all ${
              isEliminated
                ? "opacity-30 line-through bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed"
                : disabled
                ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{opt}</span>
              {pct !== null && (
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  {pct}%
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}