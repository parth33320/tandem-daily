import { motion } from "framer-motion";

interface KanjiRadicalDisplayProps {
  word: { form: string; radical?: { charIndex: number; glyph: string; icon: string; name: string; position: "left" | "top" | "whole"; breakdown: string } };
  radical?: { charIndex: number; glyph: string; icon: string; name: string; position: "left" | "top" | "whole"; breakdown: string };
  showOverlay: boolean;
  className?: string;
}

export function KanjiRadicalDisplay({ 
  word, 
  radical, 
  showOverlay, 
  className = "" 
}: KanjiRadicalDisplayProps) {
  const r = radical || word.radical;
  
  return (
    <div className={`relative ${className}`}>
      <span className="kanji-display">{word.form}</span>
      {showOverlay && r && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="relative">
            <span className="font-display text-6xl text-gold/30 drop-shadow-[0_0_20px_oklch(0.8_0.13_85)]">
              {r.glyph}
            </span>
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-paper-ink/90 text-paper px-3 py-1.5 rounded-lg text-xs font-sans whitespace-nowrap shadow-lg">
              {r.icon} {r.name} — {r.breakdown}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}