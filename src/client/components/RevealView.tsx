import type { RoundContent } from "../../shared/game/content";

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
  true: { label: "True Friend", color: "bg-emerald/20 text-emerald border-emerald/30" },
  false: { label: "False Friend", color: "bg-rose-500/20 text-rose-500 border-rose-500/30" },
  partial: { label: "Half Friend", color: "bg-amber-500/20 text-amber-500 border-amber-500/30" },
} as const;

type RelationKey = keyof typeof RELATION_LABELS;

function getRelation(relation: RelationKey) {
  return RELATION_LABELS[relation] ?? RELATION_LABELS.partial;
}

export function RevealView({ card, selectedIdx, correct, onNext, isLastCard }: RevealViewProps) {
  const relation = getRelation(card.word.relation);
  const choiceText = card.options[selectedIdx] ?? "";

  return (
    <div className="paper-card p-6 h-full flex flex-col" data-testid="reveal-card">
      {/* Relation Badge */}
      <div className="flex justify-center mb-3">
        <span className={`font-sans text-xs font-semibold px-3 py-1 rounded-full ${relation.color}`}>
          {relation.label}
        </span>
      </div>

      {/* Side-by-side JP ↔ CN columns */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div className="text-center">
          <p className="font-sans text-xs uppercase tracking-wide text-gold/60 mb-1">Japanese</p>
          <p className="font-[Noto_Serif_JP] text-2xl font-bold text-paper-ink">{card.word.form}</p>
          <p className="font-sans text-xs text-paper-ink/70 mt-1">{card.word.reading}</p>
          <p className="font-sans text-xs text-paper-ink/60 mt-2">{card.word.ja}</p>
        </div>
        <div className="text-center">
          <p className="font-sans text-xs uppercase tracking-wide text-gold/60 mb-1">Chinese</p>
          <p className="font-[Noto_Serif_JP] text-2xl font-bold text-paper-ink">{card.word.zhForm}</p>
          <p className="font-sans text-xs text-paper-ink/70 mt-1">{card.word.pinyin}</p>
          <p className="font-sans text-xs text-paper-ink/60 mt-2">{card.word.zh}</p>
        </div>
      </div>

      {/* Radical Breakdown */}
      {card.word.radical && (
        <div className="glass rounded-lg p-3 mb-3 text-center">
          <p className="font-sans text-xs uppercase tracking-wide text-gold/60 mb-1">Radical</p>
          <p className="font-display text-2xl">{card.word.radical.icon} {card.word.radical.glyph}</p>
          <p className="font-sans text-xs text-paper-ink/70">
            {card.word.radical.name} — {card.word.radical.breakdown}
          </p>
        </div>
      )}

      {/* Fun Fact Box */}
      <div className="glass rounded-lg p-3 mb-3 border-l-4 border-gold">
        <p className="font-sans text-xs uppercase tracking-wide text-gold/60 mb-1">✦ Fun Fact</p>
        <p className="font-sans text-sm text-paper-ink/90 leading-relaxed">
          {card.word.facts[0]}
        </p>
      </div>

      {/* Choice Result Strip */}
      <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${correct ? "bg-emerald/20" : "bg-rose-500/20"}`}>
        <span className="font-display text-xl">{correct ? "🟩" : "🟥"}</span>
        <span className="font-sans text-sm font-medium text-paper-ink">
          {correct ? "Correct!" : "Wrong"} — {choiceText}
        </span>
      </div>

      {/* Gold Next/Final Button */}
      <button
        className="mt-auto bg-primary text-primary-foreground font-sans font-semibold py-3 rounded-full text-base shadow-[0_4px_20px_-4px_oklch(0.78_0.13_80/0.5)] hover:shadow-[0_6px_30px_-6px_oklch(0.78_0.13_80/0.7)]"
        onClick={onNext}
        data-testid="next-card-button"
      >
        {isLastCard ? "See Final Score →" : "Next Card →"}
      </button>
    </div>
  );
}