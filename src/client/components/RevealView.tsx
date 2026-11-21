import type { RoundContent } from "@/lib/content";

interface RevealViewProps {
  card: RoundContent;
  selectedIdx: number;
  correct: boolean;
  stats?: { [choice: string]: number } | undefined;
  directionMode: "zh2ja" | "ja2zh" | "en";
  onNext: () => void;
  isLastCard: boolean;
}

const RELATION_LABELS = {
  true: { label: "True Friend", color: "badge-true", emoji: "✅" },
  false: { label: "False Friend", color: "badge-false", emoji: "❌" },
  partial: { label: "Half Friend", color: "badge-partial", emoji: "⚠️" },
} as const;

type RelationKey = keyof typeof RELATION_LABELS;

function getRelation(relation: RelationKey) {
  return RELATION_LABELS[relation] ?? RELATION_LABELS.partial;
}

export function RevealView({ card, selectedIdx, correct, stats, directionMode, onNext, isLastCard }: RevealViewProps) {
  const relation = getRelation(card.word.relation);
  const total = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0;
  const isEnMode = directionMode === "en";

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md space-y-2 overflow-hidden animate-in p-2.5 sm:p-4">
      {/* Relation badge - now visible after answer */}
      <div className="flex items-center justify-between mb-2 w-full max-w-md">
        <span className={`badge ${relation.color} text-xs`}>
          {relation.emoji} {relation.label}
        </span>
        <span className={`text-xs font-semibold ${correct ? "text-emerald-light" : "text-crimson-light"}`}>
          {correct ? "Correct!" : "Wrong"}
        </span>
      </div>

      {/* 50/50 Trap badge for en mode on false friends */}
      {isEnMode && card.word.relation === "false" && (
        <div className="badge badge-trap text-center mx-auto mb-2 animate-in text-xs">
          ⚠️ 50/50 Trap: Pick the Japanese meaning
        </div>
      )}

      {/* Side-by-side JP/ZH reveal - keep grid-cols-2 on mobile */}
      <div className="game-card p-3 grid grid-cols-2 gap-2 mb-2 w-full max-w-md">
        <div className="bg-ink-light/30 rounded-lg p-2.5">
          <div className="text-[10px] text-border-light mb-0.5">Japanese</div>
          <div className="kanji-display text-xl mb-0.5">{card.word.form}</div>
          <div className="reading-text text-xs mb-1">{card.word.reading}</div>
          <div className="meaning-text text-xs">{card.word.ja}</div>
        </div>
        <div className="bg-ink-light/30 rounded-lg p-2.5">
          <div className="text-[10px] text-border-light mb-0.5">Chinese</div>
          <div className="kanji-display text-xl mb-0.5">{card.word.zhForm}</div>
          <div className="reading-text text-xs mb-1">{card.word.pinyin}</div>
          <div className="meaning-text text-xs">{card.word.zh}</div>
        </div>
      </div>

      {/* Radical breakdown */}
      {card.word.radical && (
        <div className="game-card p-2.5 mb-2 animate-in w-full max-w-md">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-lg">{card.word.radical.icon}</span>
            <span className="font-semibold text-gold-light text-sm">{card.word.radical.name} radical</span>
          </div>
          <div className="radical-breakdown text-center text-sm">
            {card.word.radical.breakdown}
          </div>
        </div>
      )}

      {/* Fun fact */}
      <div className="fact-text text-center mb-2 text-[11px] w-full max-w-md">
        {card.word.facts[0]}
      </div>

      {/* Collapsed choice results - only show what was picked + correct answer */}
      <div className="space-y-1.5 w-full max-w-md">
        {card.options.map((opt, idx) => {
          const isCorrect = idx === card.correct;
          const isSelected = idx === selectedIdx;
          const pct = stats && total > 0 ? Math.round((stats[idx.toString()] || 0) / total * 100) : null;
          
          // In reveal, only show selected and correct
          if (!isSelected && !isCorrect) return null;
          
          return (
            <div
              key={idx}
              className={`game-card p-2 transition-all ${
                isCorrect
                  ? "border-l-4 border-emerald bg-emerald/5"
                  : "border-l-4 border-crimson bg-crimson/5"
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className={`font-medium ${isCorrect ? "text-emerald-light" : "text-crimson-light"} text-sm`}>
                  {isSelected ? "Your pick: " : "Correct: "} {opt}
                </span>
                {pct !== null && (
                  <span className="stat-pill gold text-[10px] px-1.5 py-0.5">
                    {pct}% picked
                  </span>
                )}
              </div>
              {isCorrect && (
                <div className="text-[10px] text-emerald-light mt-0.5">✓ Correct answer</div>
              )}
              {isSelected && !isCorrect && (
                <div className="text-[10px] text-crimson-light mt-0.5">✗ Your answer</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Next Card / See Final Score button - always visible at bottom */}
      <div className="w-full max-w-md mt-auto pt-2">
        <button
          onClick={onNext}
          className="w-full btn-primary py-2.5 text-sm font-semibold"
        >
          {isLastCard ? "See Final Score →" : "Next Card →"}
        </button>
      </div>
    </div>
  );
}