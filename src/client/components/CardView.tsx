import type { RoundContent } from "@/lib/content";

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
  showCommunityStats: boolean;
  communityStats: { [choice: string]: number } | undefined;
  directionMode: "zh2ja" | "ja2zh" | "en";
}

const RELATION_LABELS = {
  true: { label: "True Friend", color: "badge-true" },
  false: { label: "False Friend", color: "badge-false" },
  partial: { label: "Half Friend", color: "badge-partial" },
} as const;

type RelationKey = keyof typeof RELATION_LABELS;

function getRelation(relation: RelationKey) {
  return RELATION_LABELS[relation] ?? RELATION_LABELS.partial;
}

function getClipPath(position: "left" | "top" | "whole"): string {
  switch (position) {
    case "left": return "inset(0 60% 0 0)";
    case "top": return "inset(0 0 60% 0)";
    case "whole": return "inset(0 0 0 0)";
  }
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
  showCommunityStats,
  communityStats,
  directionMode,
}: CardViewProps) {
  // For "en" (Visual Detective) mode, display as zh2ja (show Chinese, guess Japanese)
  const displayDir = direction === "en" ? "zh2ja" : direction;
  const targetLang = displayDir === "zh2ja" ? "Japanese" : "Chinese";
  const targetWord = displayDir === "zh2ja" ? card.word.form : card.word.zhForm;
  // const targetReading = displayDir === "zh2ja" ? card.word.reading : card.word.pinyin; // Unused since Show Reading removed
  const totalVotes = communityStats ? Object.values(communityStats).reduce((a, b) => a + b, 0) : 0;

  const relation = getRelation(card.word.relation);
  const isEnMode = directionMode === "en";
  const isFalseFriend = card.word.relation === "false";

  // For en mode, auto-show radical if available
  const shouldShowRadical = isEnMode && card.word.radical && !showRadicalOverlay;
  const radical = showRadicalOverlay ? card.word.radical : (shouldShowRadical ? card.word.radical : null);

  const lifelinePills = [
    { label: "✂️ 50/50", cost: 20, onClick: onFiftyFifty, disabled: !canFiftyFifty, testid: "lifeline-5050" },
    { label: "🔍 X-Ray", cost: 20, onClick: onXRay, disabled: !canXRay, hidden: !card.word.radical, testid: "lifeline-xray" },
    { label: "🎭 20-Q", cost: 15, onClick: onTwentyQuestions, disabled: !canTwentyQuestions, testid: "lifeline-20q" },
    { label: "📊 Poll", cost: 20, onClick: onAskSubreddit, disabled: !canAskSubreddit, testid: "lifeline-poll" },
  ].filter((p) => !p.hidden);

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-md">
      {/* Top HUD: Timer toggle pill + progress bar */}
      <div className="w-full max-w-md flex items-center justify-between gap-2 mb-1">
        <button
          onClick={onToggleTimer}
          className={`flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded-full border transition-colors ${
            timerEnabled
              ? "bg-gold/10 border-gold/50 text-gold-light"
              : "bg-crimson/10 border-crimson/50 text-crimson-light"
          }`}
          aria-label={timerEnabled ? "Disable timer" : "Enable timer"}
        >
          ⏱️ {timerEnabled ? `${timer}s` : "OFF"}
        </button>
        {timerEnabled && (
          <div className="flex-1 progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${(timer / 15) * 100}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Main card */}
      <div className="w-full game-card p-3 sm:p-4 relative" data-testid="question-card">
        {/* Relation badge - hidden during question, shown after reveal */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${relation.color} opacity-0 pointer-events-none`}>
            {relation.label}
          </span>
        </div>

        {/* Target Language Prompt Pill - prominent top-center */}
        <div className="mb-2 text-center">
          {targetLang === "Japanese" ? (
            <span className="inline-flex items-center gap-1.5 bg-rose-500/20 border border-rose-400/50 text-rose-200 font-semibold text-xs px-3 py-1 rounded-full">
              🇯🇵 Guess the JAPANESE meaning
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/50 text-amber-200 font-semibold text-xs px-3 py-1 rounded-full">
              🇨🇳 Guess the CHINESE meaning
            </span>
          )}
        </div>

        {/* Word display with radical glow overlay */}
        <div className="text-center mb-2 relative">
          <div className="relative inline-block leading-none">
            {targetWord.split('').map((char, idx) => {
              const isTargetChar = radical && idx === radical.charIndex;
              const showRadicalGlow = showRadicalOverlay && !!radical;
              return (
                <span key={idx} className="relative inline-block leading-none">
                  <span className="relative z-0 kanji-display block text-3xl sm:text-5xl">{char}</span>
                  {isTargetChar && showRadicalGlow && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 z-10 kanji-display block text-3xl sm:text-5xl text-amber-400 animate-pulse pointer-events-none select-none"
                      style={{ clipPath: getClipPath(radical!.position) }}
                    >
                      {char}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
          {radical && showRadicalOverlay && (
            <div className="mt-1.5 flex justify-center">
              <span className="radical-badge text-base px-2.5 py-0.5">{radical.icon}</span>
            </div>
          )}
        </div>

        {/* 50/50 Trap badge for en mode on false friends */}
        {isEnMode && isFalseFriend && (
          <div className="badge badge-trap text-center mx-auto mb-2 animate-in text-xs">
            ⚠️ 50/50 Trap: Pick the Japanese meaning
          </div>
        )}

        {/* Clues pills (20 Questions lifeline) */}
        {showClues.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mb-2 animate-in">
            {showClues.map((clue, idx) => (
              <span key={idx} className="stat-pill emerald text-[10px] px-2 py-1">
                🎭 {clue}
              </span>
            ))}
          </div>
        )}

        {/* Community stats (Ask the Subreddit lifeline) */}
        {showCommunityStats && communityStats && totalVotes > 0 && (
          <div className="mb-2 animate-in">
            <div className="text-[10px] text-border-light mb-1 text-center">Community Picks</div>
            <div className="grid grid-cols-2 gap-1">
              {card.options.map((opt, idx) => {
                const votes = communityStats[idx.toString()] || 0;
                const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                return (
                  <div key={idx} className="text-[10px]">
                    <div className="flex justify-between text-border-light mb-0.5">
                      <span className="truncate pr-1">{opt}</span>
                      <span className="font-mono text-gold-light">{pct}%</span>
                    </div>
                    <div className="h-1 bg-ink-light/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold to-emerald"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showCommunityStats && communityStats && totalVotes === 0 && (
          <div className="stat-pill crimson text-center mx-auto mb-2 animate-in text-xs">
            📊 Fewer than 3 plays today—you're setting the trend!
          </div>
        )}

        {/* 4 Lifeline pills in single row */}
        <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
          {lifelinePills.map((pill) => (
            <button
              key={pill.label}
              onClick={pill.onClick}
              disabled={pill.disabled}
              data-testid={pill.testid}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-full border transition-all ${
                pill.disabled
                  ? "opacity-50 cursor-not-allowed bg-ink-light/30 border-border"
                  : "bg-gold/10 border-gold/50 text-gold-light hover:bg-gold/20"
              }`}
              title={`${pill.label} (-${pill.cost} pts)`}
              aria-label={`${pill.label}, ${pill.cost} points`}
            >
              <span>{pill.label.split(" ")[0]}</span>
              <span className="hidden sm:inline">{pill.label.split(" ")[1]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}