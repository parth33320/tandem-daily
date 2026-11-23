interface LifelineBarProps {
  canFiftyFifty: boolean;
  canXRay: boolean;
  canTwentyQuestions: boolean;
  canAskSubreddit: boolean;
  onFiftyFifty: () => void;
  onXRay: () => void;
  onTwentyQuestions: () => void;
  onAskSubreddit: () => void;
  worthFiftyFifty: number;
  worthXRay: number;
  worthTwentyQuestions: number;
  worthAskSubreddit: number;
}

export function LifelineBar({
  canFiftyFifty,
  canXRay,
  canTwentyQuestions,
  canAskSubreddit,
  onFiftyFifty,
  onXRay,
  onTwentyQuestions,
  onAskSubreddit,
  worthFiftyFifty,
  worthXRay,
  worthTwentyQuestions,
  worthAskSubreddit,
}: LifelineBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-3 relative z-20">
      <button
        onClick={onFiftyFifty}
        disabled={!canFiftyFifty}
        className={`lifeline-pill ${!canFiftyFifty ? "opacity-40 cursor-not-allowed" : ""}`}
        aria-disabled={!canFiftyFifty}
        data-testid="lifeline-5050"
      >
        <span>✂️ 50/50</span>
        <span className="lifeline-worth">−20</span>
        <span className="lifeline-worth">Worth {worthFiftyFifty}</span>
      </button>
      <button
        onClick={onXRay}
        disabled={!canXRay}
        className={`lifeline-pill ${!canXRay ? "opacity-40 cursor-not-allowed" : ""}`}
        aria-disabled={!canXRay}
        data-testid="lifeline-xray"
      >
        <span>🔍</span>
        <span>X-Ray</span>
        <span className="lifeline-worth">−20</span>
        <span className="lifeline-worth">Worth {worthXRay}</span>
      </button>
      <button
        onClick={onTwentyQuestions}
        disabled={!canTwentyQuestions}
        className={`lifeline-pill ${!canTwentyQuestions ? "opacity-40 cursor-not-allowed" : ""}`}
        aria-disabled={!canTwentyQuestions}
        data-testid="lifeline-20q"
      >
        <span>🎭 20-Q</span>
        <span className="lifeline-worth">−15</span>
        <span className="lifeline-worth">Worth {worthTwentyQuestions}</span>
      </button>
      <button
        onClick={onAskSubreddit}
        disabled={!canAskSubreddit}
        className={`lifeline-pill ${!canAskSubreddit ? "opacity-40 cursor-not-allowed" : ""}`}
        aria-disabled={!canAskSubreddit}
        data-testid="lifeline-poll"
      >
        <span>📊 Poll</span>
        <span className="lifeline-worth">−20</span>
        <span className="lifeline-worth">Worth {worthAskSubreddit}</span>
      </button>
    </div>
  );
}