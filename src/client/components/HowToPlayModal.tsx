interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-3xl p-6 max-w-md w-full max-h-[80dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="howtoplay-modal">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold gold-text">How to Play</h2>
          <button onClick={onClose} className="text-2xl hover:text-gold transition-colors">X</button>
        </div>
        <div className="space-y-4 text-paper-ink">
          <div>
            <h3 className="font-display text-lg font-bold text-gold mb-1">Goal</h3>
            <p className="text-sm leading-relaxed">
              Guess whether Chinese and Japanese words are True Friends (same meaning), False Friends (different meanings), or Half Friends (related but shifted).
            </p>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-gold mb-1">Timer</h3>
            <p className="text-sm leading-relaxed">
              You have 15 seconds per card. Use lifelines to help you decide, but each lifeline costs points!
            </p>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-gold mb-1">Lifelines</h3>
            <ul className="text-sm leading-relaxed space-y-1">
              <li>50/50 (-20 pts) - Eliminate 2 wrong answers</li>
              <li>X-Ray (-20 pts) - Reveal the radical</li>
              <li>20-Q (-15 pts) - Get 2 progressive clues</li>
              <li>Poll (-20 pts) - See community stats</li>
            </ul>
          </div>
        </div>
        <button onClick={onClose} className="w-full mt-6 bg-primary text-primary-foreground font-sans font-semibold py-3 rounded-full text-base shadow-lg">
          Got it!
        </button>
      </div>
    </div>
  );
}