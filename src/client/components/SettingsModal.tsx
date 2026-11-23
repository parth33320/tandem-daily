import { useState } from "react";
import type { HostLang } from "../lib/host";

const THEMES = [
  { id: "felt", label: "Felt" },
  { id: "library", label: "Library" },
  { id: "neon", label: "Neon" },
  { id: "ink", label: "Ink" },
  { id: "lacquer", label: "Lacquer" },
];

const LANGS: { id: HostLang; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "zh", label: "中文" },
  { id: "ja", label: "日本語" },
  { id: "es", label: "ES" },
  { id: "ar", label: "AR" },
  { id: "fr", label: "FR" },
];

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  hostLang: HostLang;
  onLangChange: (lang: HostLang) => void;
  muted: boolean;
  onMuteChange: (muted: boolean) => void;
}

export function SettingsModal({ open, onClose, hostLang, onLangChange, muted, onMuteChange }: SettingsModalProps) {
  const [theme, setTheme] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-theme") || "felt";
    }
    return "felt";
  });

  if (!open) return null;

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("tandem-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-3xl p-6 max-w-md w-full max-h-[80dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold gold-text">Settings</h2>
          <button onClick={onClose} className="text-2xl hover:text-gold transition-colors">✕</button>
        </div>
        <div className="mb-6">
          <p className="font-sans uppercase tracking-[0.3em] text-xs text-gold/70 mb-3">Table Theme</p>
          <div className="grid grid-cols-5 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  theme === t.id ? "bg-primary text-primary-foreground shadow-lg" : "glass hover:bg-primary/10"
                }`}
                data-testid={`theme-option-${t.id}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <p className="font-sans uppercase tracking-[0.3em] text-xs text-gold/70 mb-3">Host Language</p>
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => onLangChange(l.id)}
                className={`px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                  hostLang === l.id ? "bg-primary text-primary-foreground" : "border border-primary/50 text-primary hover:bg-primary/10"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => onMuteChange(!muted)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            muted ? "bg-destructive/20 text-destructive" : "bg-emerald/20 text-emerald"
          }`}
        >
          {muted ? "🔇 Muted" : "🔊 On"}
        </button>
        <button onClick={onClose} className="w-full mt-6 bg-primary text-primary-foreground font-sans font-semibold py-3 rounded-full text-base shadow-lg">
          Done
        </button>
      </div>
    </div>
  );
}