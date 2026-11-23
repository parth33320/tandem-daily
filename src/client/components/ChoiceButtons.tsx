import type { RoundContent } from "@/lib/content";

interface ChoiceButtonsProps {
  card: RoundContent;
  direction: "zh2ja" | "ja2zh" | "en";
  eliminatedIndices: number[];
  onSelect: (idx: number) => void;
  disabled: boolean;
  stats?: { [choice: string]: number } | undefined;
}

export function ChoiceButtons({ card, direction, eliminatedIndices, onSelect, disabled, stats }: ChoiceButtonsProps) {
  // For "en" (Visual Detective) mode, use Japanese options (zh2ja)
  const displayDir = direction === "en" ? "zh2ja" : direction;
  const optionSet = displayDir === "ja2zh" ? card.zh : { options: card.options, correct: card.correct, drop: card.drop };
  const total = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
      {optionSet.options.map((opt: string, idx: number) => {
        const isEliminated = eliminatedIndices.includes(idx);
        const pct = stats && total > 0 ? Math.round((stats[idx.toString()] || 0) / total * 100) : null;
        return (
          <button
            key={idx}
            onClick={() => !disabled && !isEliminated && onSelect(idx)}
            disabled={disabled || isEliminated}
            data-testid={`answer-option-${idx}`}
            className={`choice-btn transition-all ${
              isEliminated
                ? "opacity-25 line-through cursor-not-allowed"
                : disabled
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{opt}</span>
              {pct !== null && (
                <span className="stat-pill gold text-[10px] px-1.5 py-0.5">
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