import "./index.css";

import { navigateTo, requestExpandedMode } from "@devvit/web/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

export const Splash = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--scene)' }}>
      <div className="glass rounded-3xl p-8 sm:p-12 max-w-md w-full text-center relative overflow-hidden">
        {/* Subtle felt texture bg */}
        <div className="absolute inset-0 bg-[var(--theme-felt)]/30 opacity-10" />

        {/* Tracking eyebrow */}
        <p className="font-sans uppercase tracking-[0.3em] text-xs text-gold/70 mb-4 relative z-10">
          CHINESE × JAPANESE
        </p>

        {/* Gold gradient title */}
        <h1 className="font-display text-4xl sm:text-6xl font-bold gold-text mb-6 leading-tight relative z-10">
          Tandem Daily
        </h1>

        {/* Miniature card-back emblem */}
        <div className="card-back w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 flex items-center justify-center rounded-lg border-2 border-[oklch(0.92_0.04_85)] relative z-10">
          <span className="font-display text-2xl text-paper-ink">縁</span>
        </div>

        {/* Gold primary CTA */}
        <button
          className="bg-primary text-primary-foreground font-sans font-semibold px-8 py-3 rounded-full text-base shadow-[0_4px_20px_-4px_oklch(0.78_0.13_80/0.5)] hover:shadow-[0_6px_30px_-6px_oklch(0.78_0.13_80/0.7)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background relative z-10"
          onClick={(e) => requestExpandedMode(e.nativeEvent, "game")}
        >
          Play Today's 5 Cards
        </button>

        {/* Subtle hint */}
        <p className="mt-4 font-sans text-xs text-foreground/50 relative z-10">
          5 cards · 15s each · True/False/Half Friends
        </p>
      </div>

      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 text-[0.7em] text-foreground/40 mt-6">
        <button className="cursor-pointer hover:text-gold transition-colors" onClick={() => navigateTo("https://developers.reddit.com/docs")}>
          Docs
        </button>
        <span className="text-foreground/20">|</span>
        <button className="cursor-pointer hover:text-gold transition-colors" onClick={() => navigateTo("https://www.reddit.com/r/Devvit")}>
          r/Devvit
        </button>
        <span className="text-foreground/20">|</span>
        <button className="cursor-pointer hover:text-gold transition-colors" onClick={() => navigateTo("https://discord.com/invite/R7yu2wh9Qz")}>
          Discord
        </button>
      </footer>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);