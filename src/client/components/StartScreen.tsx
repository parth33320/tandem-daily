import { useState } from "react";
import type { Direction } from "@/shared/api";

interface StartScreenProps {
  puzzleNumber: number;
  onStart: (direction: Direction, practiceMode?: boolean) => void;
  alreadyPlayed?: boolean;
}

export function StartScreen({ onStart, alreadyPlayed }: StartScreenProps) {
  const [direction, setDirection] = useState<Direction>("zh2ja");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: 'var(--scene)' }}>
      <div className="glass rounded-3xl p-8 sm:p-12 max-w-md w-full text-center space-y-8">
        {/* Eyebrow */}
        <p className="font-sans uppercase tracking-[0.3em] text-xs text-gold/70">
          CHINESE × JAPANESE
        </p>

        {/* Gold gradient heading */}
        <h1 className="font-display text-4xl sm:text-5xl font-bold gold-text leading-tight">
          Tandem Daily
        </h1>

        {alreadyPlayed && (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald/80 animate-in">
            <span>✓</span>
            <span>Today's streak saved</span>
          </div>
        )}

        {/* Direction Chips - REAL radio inputs inside styled labels */}
        <div className="flex items-center justify-center gap-3 flex-wrap" role="radiogroup">
          {['zh2ja', 'ja2zh', 'en'].map((dir) => (
            <label
              key={dir}
              className={`font-sans text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer
                ${direction === dir
                  ? 'bg-primary text-primary-foreground shadow-[0_4px_16px_-4px_oklch(0.78_0.13_80/0.5)]'
                  : 'border border-primary/50 text-primary hover:bg-primary/10'
                }`}
              data-testid={`direction-${dir}`}
            >
              <input
                type="radio"
                className="sr-only"
                name="direction"
                value={dir}
                checked={direction === dir}
                onChange={() => setDirection(dir as Direction)}
              />
              {dir === 'zh2ja' && '🇨🇳 → 🇯🇵 Chinese → Japanese'}
              {dir === 'ja2zh' && '🇯🇵 → 🇨🇳 Japanese → Chinese'}
              {dir === 'en' && '🕵️ Visual Detective'}
            </label>
          ))}
        </div>

        {/* Full-width gold CTA */}
        <button
          onClick={() => onStart(direction, alreadyPlayed)}
          className="w-full bg-primary text-primary-foreground font-sans font-semibold py-3.5 rounded-full text-base shadow-[0_4px_20px_-4px_oklch(0.78_0.13_80/0.5)] hover:shadow-[0_6px_30px_-6px_oklch(0.78_0.13_80/0.7)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          data-testid="start-button"
        >
          {alreadyPlayed ? 'Play Again (Practice Mode)' : 'Start Game'}
        </button>

        {/* Practice mode link */}
        <button
          className="font-sans text-sm text-foreground/60 hover:text-gold transition-colors"
          onClick={() => onStart(direction, true)}
        >
          Practice Mode (seeded)
        </button>
      </div>
    </div>
  );
}