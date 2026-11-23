import { useState, useEffect } from "react";

interface MyTrapsModalProps {
  open: boolean;
  onClose: () => void;
  onPracticeTraps: (words: Array<{ id: number; form: string }>) => void;
}

interface MissedWord {
  wordId: number;
  form: string;
  reading: string;
  meaning_ja: string;
  meaning_zh: string;
  relation: string;
  missCount: number;
  lastMissedAt: number;
}

export function MyTrapsModal({ open, onClose, onPracticeTraps }: MyTrapsModalProps) {
  const [traps, setTraps] = useState<MissedWord[]>([]);

  useEffect(() => {
    let cancelled = false;
   void  void (async () => {
      try {
        const res = await fetch("/api/me/missed");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setTraps(data.missed ?? []);
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleClear = async (wordId: number) => {
    try {
      await fetch(`/api/me/missed/${wordId}`, { method: "DELETE" });
      setTraps((prev) => prev.filter((t) => t.wordId !== wordId));
    } catch {
      // ignore
    }
  };

  const handlePractice = () => {
    if (traps.length === 0) return;
    onPracticeTraps(traps.map((t) => ({ id: t.wordId, form: t.form })));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-3xl p-6 max-w-md w-full max-h-[80dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold gold-text">My Traps</h2>
          <button onClick={onClose} className="text-2xl hover:text-gold transition-colors">X</button>
        </div>

        {traps.length === 0 ? (
          <div className="text-center py-8 text-paper-ink/70">
            <p className="font-display text-xl text-gold mb-2">No Traps Yet!</p>
            <p className="text-sm text-paper-ink/60">You haven't missed any words yet. Keep playing to build your trap collection!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {traps.map((trap) => (
                <div key={trap.wordId} className="glass rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-[Noto_Serif_JP] text-xl font-bold text-paper-ink">{trap.form}</p>
                    <p className="text-xs text-paper-ink/60">
                      {trap.relation === "false" ? "False Friend" : trap.relation === "partial" ? "Half Friend" : "True Friend"} · Missed {trap.missCount}x
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleClear(trap.wordId)}
                      className="text-rose hover:text-rose/70 text-sm font-medium"
                      data-testid="clear-trap-button"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handlePractice}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-full text-base shadow-lg"
              disabled={traps.length === 0}
              data-testid="practice-traps-button"
            >
              Practice My Traps
            </button>
          </>
        )}
      </div>
    </div>
  );
}
