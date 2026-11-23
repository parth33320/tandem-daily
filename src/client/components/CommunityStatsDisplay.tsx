import { motion } from "framer-motion";

interface CommunityStatsDisplayProps {
  options: string[];
  stats: { [choice: string]: number } | undefined;
  totalVotes: number;
}

export function CommunityStatsDisplay({ options, stats, totalVotes }: CommunityStatsDisplayProps) {
  if (!stats || totalVotes === 0) return null;
  
  return (
    <motion.div
      className="mb-3 p-3 glass rounded-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="font-sans text-xs uppercase tracking-wide text-gold/60 mb-2">Community Picks</div>
      <div className="space-y-2">
        {options.map((option, idx) => {
          const count = stats[idx.toString()] || 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          
          return (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-8 text-center font-sans text-sm text-gold/70">
                {String.fromCharCode(65 + idx)}
              </span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="text-paper-ink/90">{option}</span>
                  <span className="font-mono text-gold">{pct}%</span>
                </div>
                <div className="similarity-bar">
                  <motion.div
                    className="similarity-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-center text-xs text-paper-ink/50">
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
      </div>
    </motion.div>
  );
}