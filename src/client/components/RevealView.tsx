import type { RoundContent } from "@/lib/content";

interface RevealViewProps {
  card: RoundContent;
  selectedIdx: number;
  correct: boolean;
  stats?: { [choice: string]: number } | undefined;
}

const RELATION_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  true: { label: "True Friend", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", emoji: "✅" },
  false: { label: "False Friend", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", emoji: "❌" },
  partial: { label: "Half Friend", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", emoji: "⚠️" },
};

type RelationLabel = { label: string; color: string; emoji: string };

function getRelation(relation: string): RelationLabel {
  const key = relation as keyof typeof RELATION_LABELS;
  const result = RELATION_LABELS[key];
  return (result ?? RELATION_LABELS.partial) as RelationLabel;
}

export function RevealView({ card, selectedIdx, correct, stats }: RevealViewProps) {
  const relation = getRelation(card.word.relation);
  const total = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="w-full max-w-md space-y-3 animate-in fade-in-0 duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${relation.color}`}>
            {relation.emoji} {relation.label}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {correct ? "Correct!" : "Wrong"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Japanese</div>
            <div className="font-bold text-gray-900 dark:text-gray-100">{card.word.form}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">{card.word.reading}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{card.word.ja}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Chinese</div>
            <div className="font-bold text-gray-900 dark:text-gray-100">{card.word.zhForm}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">{card.word.pinyin}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{card.word.zh}</div>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {card.word.facts[0]}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {card.options.map((opt: string, idx: number) => {
          const isCorrect = idx === card.correct;
          const isSelected = idx === selectedIdx;
          const pct = stats && total > 0 ? Math.round((stats[idx.toString()] || 0) / total * 100) : null;
          return (
            <div
              key={idx}
              className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                isCorrect
                  ? "bg-green-50 dark:bg-green-900/30 border-green-400"
                  : isSelected
                  ? "bg-red-50 dark:bg-red-900/30 border-red-400"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={isCorrect ? "font-semibold" : ""}>{opt}</span>
                {pct !== null && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                    {pct}%
                  </span>
                )}
              </div>
              {isCorrect && <div className="text-xs text-green-700 dark:text-green-300 mt-1">✓ Correct answer</div>}
              {isSelected && !isCorrect && <div className="text-xs text-red-700 dark:text-red-300 mt-1">✗ Your answer</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}