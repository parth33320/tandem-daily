import type { RoundContent } from "@/lib/content";

interface CardViewProps {
  card: RoundContent;
  direction: "zh2ja" | "ja2zh";
  showReading: boolean;
  onEliminate: () => void;
  onShowReading: () => void;
  canEliminate: boolean;
  canShowReading: boolean;
}

const RELATION_LABELS: Record<string, { label: string; color: string }> = {
  true: { label: "True Friend", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  false: { label: "False Friend", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  partial: { label: "Half Friend", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
};

type RelationLabel = { label: string; color: string };

function getRelation(relation: string): RelationLabel {
  const key = relation as keyof typeof RELATION_LABELS;
  const result = RELATION_LABELS[key];
  return (result ?? RELATION_LABELS.partial) as RelationLabel;
}

export function CardView({
  card,
  direction,
  showReading,
  onEliminate,
  onShowReading,
  canEliminate,
  canShowReading,
}: CardViewProps) {
  const targetLang = direction === "zh2ja" ? "Japanese" : "Chinese";
  const targetWord = direction === "zh2ja" ? card.word.form : card.word.zhForm;
  const targetReading = direction === "zh2ja" ? card.word.reading : card.word.pinyin;

  const relation = getRelation(card.word.relation);

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md">
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${relation.color}`}>
            {relation.label}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{targetLang}</span>
        </div>

        <div className="text-center mb-3">
          <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">{targetWord}</div>
          {showReading && (
            <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">{targetReading}</div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onEliminate}
            disabled={!canEliminate}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ✂ Eliminate 2
          </button>
          <button
            onClick={onShowReading}
            disabled={!canShowReading || showReading}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            文 Show Reading
          </button>
        </div>
      </div>
    </div>
  );
}