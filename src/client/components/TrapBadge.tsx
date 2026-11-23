interface TrapBadgeProps {
  isEnMode: boolean;
  isFalseFriend: boolean;
}

export function TrapBadge({ isEnMode, isFalseFriend }: TrapBadgeProps) {
  if (!isEnMode || !isFalseFriend) return null;
  
  return (
    <div className="mb-3">
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-500 text-xs font-semibold font-sans uppercase tracking-wide">
        ⚠️ False Friend Trap
      </span>
    </div>
  );
}