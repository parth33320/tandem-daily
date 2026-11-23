import { useState, useEffect } from "react";

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
}

interface LeaderboardEntry {
  username: string;
  score: number;
}

export function LeaderboardModal({ open, onClose }: LeaderboardModalProps) {
  const [direction, setDirection] = useState<"zh2ja" | "ja2zh" | "en">("zh2ja");
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/leaderboard?direction=${direction}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setScores(data.scores ?? []);
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [direction]);

  if (!open) return null;

  const tabs = [
    { id: "zh2ja" as const, label: "🇨🇳 → 🇯🇵 Chinese → Japanese" },
    { id: "ja2zh" as const, label: "🇯🇵 → 🇨🇳 Japanese → Chinese" },
    { id: "en" as const, label: "🕵️ Visual Detective" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-3xl p-6 max-w-md w-full max-h-[80dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold gold-text">Leaderboard</h2>
          <button onClick={onClose} className="text-2xl hover:text-gold transition-colors">✕</button>
        </div>
        
        <div className="flex gap-2 mb-4" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={direction === tab.id}
              onClick={() => setDirection(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                direction === tab.id ? "bg-primary text-primary-foreground" : "glass hover:bg-primary/10"
              }`}
              data-testid={`leaderboard-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {scores.length === 0 ? (
            <p className="text-center py-8 text-paper-ink/50 text-sm">No scores yet. Be the first!</p>
          ) : (
            scores.map((entry, i) => (
              <div key={entry.username} className="flex items-center justify-between p-2 glass rounded-lg">
                <span className="font-display text-gold">{i + 1}.</span>
                <span className="font-sans text-paper-ink">{entry.username}</span>
                <span className="font-bold text-gold">{entry.score} pts</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}