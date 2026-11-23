import type { RoundContent } from "@/lib/content";
import { KanjiRadicalDisplay } from "./KanjiRadicalDisplay";
import { TargetLanguagePrompt } from "./TargetLanguagePrompt";
import { TrapBadge } from "./TrapBadge";
import { CluesDisplay } from "./CluesDisplay";
import { CommunityStatsDisplay } from "./CommunityStatsDisplay";
import { LifelineBar } from "./LifelineBar";

interface CardViewProps {
  card: RoundContent;
  direction: "zh2ja" | "ja2zh" | "en";
  timer: number;
  timerEnabled: boolean;
  onToggleTimer: () => void;
  onFiftyFifty: () => void;
  onXRay: () => void;
  onTwentyQuestions: () => void;
  onAskSubreddit: () => void;
  canFiftyFifty: boolean;
  canXRay: boolean;
  canTwentyQuestions: boolean;
  canAskSubreddit: boolean;
  showRadicalOverlay: boolean;
  showClues: string[];
  communityStats: { [choice: string]: number } | undefined;
  directionMode: "zh2ja" | "ja2zh" | "en";
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

function calculateWorth(
  basePoints: number,
  canFiftyFifty: boolean,
  canXRay: boolean,
  canTwentyQuestions: boolean,
  canAskSubreddit: boolean
): number {
  let worth = basePoints;
  if (!canFiftyFifty) worth -= 20;
  if (!canXRay) worth -= 20;
  if (!canTwentyQuestions) worth -= 15;
  if (!canAskSubreddit) worth -= 20;
  return Math.max(0, worth);
}

export function CardView({
  card,
  direction,
  timer,
  timerEnabled,
  onToggleTimer,
  onFiftyFifty,
  onXRay,
  onTwentyQuestions,
  onAskSubreddit,
  canFiftyFifty,
  canXRay,
  canTwentyQuestions,
  canAskSubreddit,
  showRadicalOverlay,
  showClues,
  communityStats,
  directionMode,
}: CardViewProps) {
  const displayDir = direction === "en" ? "zh2ja" : direction;
  // For "en" (Visual Detective) mode, display as zh2ja (show Chinese, guess Japanese)
  const targetWord = displayDir === "zh2ja" ? card.word.form : card.word.zhForm;
  const totalVotes = communityStats ? Object.values(communityStats).reduce((a, b) => a + b, 0) : 0;

  const relation = getRelation(card.word.relation);
  const isEnMode = directionMode === "en";
  const isFalseFriend = card.word.relation === "false";

  const shouldShowRadical = isEnMode && card.word.radical && !showRadicalOverlay;
  const radical = showRadicalOverlay ? card.word.radical : (shouldShowRadical ? card.word.radical : null);

  const BASE_POINTS = 100;
  const worthFiftyFifty = calculateWorth(BASE_POINTS, false, canXRay, canTwentyQuestions, canAskSubreddit);
  const worthXRay = calculateWorth(BASE_POINTS, canFiftyFifty, false, canTwentyQuestions, canAskSubreddit);
  const worthTwentyQuestions = calculateWorth(BASE_POINTS, canFiftyFifty, canXRay, false, canAskSubreddit);
  const worthAskSubreddit = calculateWorth(BASE_POINTS, canFiftyFifty, canXRay, canTwentyQuestions, false);

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-md">
      <div className="flex items-center justify-end gap-2 mb-2">
        <button
          onClick={onToggleTimer}
          className={`timer-ring ${timer <= 5 && timer > 0 ? "timer-ring-warning" : ""}`}
          aria-label={timerEnabled ? "Disable timer" : "Enable timer"}
          aria-pressed={timerEnabled}
        >
          {timerEnabled ? `⏱️ ${timer}s` : "⏱️ OFF"}
        </button>
      </div>

      <div className="w-full paper-card p-4 sm:p-6 relative" data-testid="question-card">
        {/* Relation badge - hidden during question */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${relation.color} opacity-0 pointer-events-none`}>
            {relation.label}
          </span>
        </div>

        {/* Target Language Prompt Pill */}
        <TargetLanguagePrompt direction={direction} directionMode={directionMode} />

        {/* Word display with radical glow overlay */}
        <div className="flex items-center justify-center mb-4 relative">
          <KanjiRadicalDisplay
            word={card.word.radical ? { form: targetWord, radical: card.word.radical } : { form: targetWord }}
            {...(radical ? { radical } : {})}
            showOverlay={showRadicalOverlay}
            className="font-[Noto_Serif_JP] text-4xl sm:text-5xl md:text-6xl"
          />
        </div>

        {/* 50/50 Trap badge for en mode on false friends */}
        <TrapBadge isEnMode={isEnMode} isFalseFriend={isFalseFriend} />

        {/* 20-Q Clues */}
        <CluesDisplay clues={showClues} />

        {/* Community stats (Ask the Subreddit lifeline) */}
        <CommunityStatsDisplay
          options={card.options}
          stats={communityStats}
          totalVotes={totalVotes}
        />

        {/* Compact Glass Lifelines Tray */}
        <LifelineBar
          canFiftyFifty={canFiftyFifty}
          canXRay={canXRay}
          canTwentyQuestions={canTwentyQuestions}
          canAskSubreddit={canAskSubreddit}
          onFiftyFifty={onFiftyFifty}
          onXRay={onXRay}
          onTwentyQuestions={onTwentyQuestions}
          onAskSubreddit={onAskSubreddit}
          worthFiftyFifty={worthFiftyFifty}
          worthXRay={worthXRay}
          worthTwentyQuestions={worthTwentyQuestions}
          worthAskSubreddit={worthAskSubreddit}
        />
      </div>
    </div>
  );
}