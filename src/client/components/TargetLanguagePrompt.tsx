interface TargetLanguagePromptProps {
  direction: "zh2ja" | "ja2zh" | "en";
  directionMode: "zh2ja" | "ja2zh" | "en";
}

const labels: Record<"zh2ja" | "ja2zh" | "en", string> = {
  zh2ja: "Guess the JAPANESE meaning",
  ja2zh: "Guess the CHINESE meaning",
  en: "Guess the MEANING from form",
};

export function TargetLanguagePrompt({ direction, directionMode }: TargetLanguagePromptProps) {
  const label = labels[directionMode] || labels[direction];
  
  return (
    <div className="mb-3">
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-semibold font-sans uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}