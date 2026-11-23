import { useState, useEffect } from "react";
import type { Direction } from "@/shared/api";
import { useVoiceHost } from "../hooks/useVoiceHost";
import { useMultiplayerRoom } from "../hooks/useMultiplayerRoom";

interface StartScreenProps {
  puzzleNumber: number;
  onStart: (direction: Direction, practiceMode?: boolean) => void;
  alreadyPlayed?: boolean;
}

export function StartScreen({ onStart, alreadyPlayed }: StartScreenProps) {
  const [direction, setDirection] = useState<Direction>("zh2ja");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const voiceHost = useVoiceHost();
  const multiplayer = useMultiplayerRoom();

  const handleStart = (dir: Direction, practice = false) => {
    voiceHost.unlockVoice();
    onStart(dir, practice);
  };

  const handleCreateRoom = async () => {
    voiceHost.unlockVoice();
    await multiplayer.createRoom(direction);
  };

  const handleJoinRoom = async () => {
    voiceHost.unlockVoice();
    if (roomCodeInput.trim().length === 5) {
      await multiplayer.joinRoom(roomCodeInput.trim().toUpperCase());
    }
  };

  const handleStartRoom = async () => {
    await multiplayer.startRoom();
  };

  // Auto-start game when room transitions to playing
  useEffect(() => {
    if (multiplayer.room?.status === "playing") {
      handleStart(multiplayer.room.direction);
    }
  }, [multiplayer.room?.status]);

  // Show room lobby if in a room
  if (multiplayer.room?.status === "lobby") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: 'var(--scene)' }}>
        <div className="glass rounded-3xl p-8 sm:p-12 max-w-md w-full text-center space-y-6" data-testid="room-lobby">
          <p className="font-sans uppercase tracking-[0.3em] text-xs text-gold/70">
            MULTIPLAYER LOBBY
          </p>
          
          <div className="flex items-center justify-center gap-2" data-testid="room-code-display">
            <span className="font-display text-3xl font-bold text-gold tracking-wider">
              {multiplayer.room.code}
            </span>
          </div>
          
          <div className="space-y-2">
            <p className="font-sans text-xs uppercase tracking-wide text-gold/60">Players ({multiplayer.room.players.length})</p>
            {multiplayer.room.players.map((player: { username: string; score: number }) => (
              <div key={player.username} className="glass rounded-lg px-3 py-2 font-sans text-sm text-paper-ink">
                {player.username} · {player.score} pts
              </div>
            ))}
          </div>
          
          {/* Table Chat */}
          <div className="space-y-2">
            <p className="font-sans text-xs uppercase tracking-wide text-gold/60">Table Chat</p>
            <div className="glass rounded-lg p-3 max-h-32 overflow-y-auto space-y-1" data-testid="room-chat-messages">
              {multiplayer.room.chat.map((msg: { id: string; username: string; text: string }) => (
                <p key={msg.id} className="font-sans text-xs text-paper-ink">
                  <span className="text-gold">{msg.username}:</span> {msg.text}
                </p>
              ))}
            </div>
            <input
              type="text"
              className="w-full glass rounded-lg px-3 py-2 font-sans text-sm text-paper-ink placeholder:text-paper-ink/40"
              placeholder="Type a message..."
              data-testid="room-chat-input"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const input = e.target as HTMLInputElement;
                  if (input.value.trim()) {
                    void multiplayer.sendChat(input.value);
                    input.value = "";
                  }
                }
              }}
            />
          </div>
          
          <button
            onClick={handleStartRoom}
            className="w-full bg-primary text-primary-foreground font-sans font-semibold py-3.5 rounded-full text-base shadow-[0_4px_20px_-4px_oklch(0.78_0.13_80/0.5)] hover:shadow-[0_6px_30px_-6px_oklch(0.78_0.13_80/0.7)] transition-all duration-200"
            data-testid="start-room-button"
          >
            Start Match
          </button>
          
          <button
            onClick={multiplayer.leaveRoom}
            className="font-sans text-sm text-foreground/60 hover:text-gold transition-colors"
          >
            Leave Room
          </button>
        </div>
      </div>
    );
  }

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
          onClick={() => handleStart(direction, alreadyPlayed)}
          className="w-full bg-primary text-primary-foreground font-sans font-semibold py-3.5 rounded-full text-base shadow-[0_4px_20px_-4px_oklch(0.78_0.13_80/0.5)] hover:shadow-[0_6px_30px_-6px_oklch(0.78_0.13_80/0.7)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          data-testid="start-button"
        >
          {alreadyPlayed ? 'Play Again (Practice Mode)' : 'Start Game'}
        </button>

        {/* Practice mode link */}
        <button
          className="font-sans text-sm text-foreground/60 hover:text-gold transition-colors"
          onClick={() => handleStart(direction, true)}
        >
          Practice Mode (seeded)
        </button>

        {/* Voice Host Mute Toggle */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={voiceHost.toggleMute}
            className="font-sans text-sm text-foreground/60 hover:text-gold transition-colors"
            data-testid="host-mute-toggle"
            aria-label={voiceHost.muted ? "Unmute voice host" : "Mute voice host"}
          >
            {voiceHost.muted ? "🔇" : "🔊"} Voice Host
          </button>
        </div>

        {/* Multiplayer Section */}
        <div className="border-t border-primary/20 pt-4 space-y-3">
          <p className="font-sans uppercase tracking-[0.3em] text-xs text-gold/70">
            MULTIPLAYER
          </p>
          
          <button
            onClick={handleCreateRoom}
            disabled={multiplayer.loading}
            className="w-full border-2 border-primary text-primary font-sans font-semibold py-3 rounded-full text-base hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            data-testid="create-room-button"
          >
            {multiplayer.loading ? "Creating..." : "Create Room"}
          </button>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 glass rounded-full px-4 py-2 font-sans text-sm text-paper-ink placeholder:text-paper-ink/40 uppercase tracking-wider text-center"
              placeholder="Room Code"
              maxLength={5}
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              data-testid="room-code-input"
            />
            <button
              onClick={handleJoinRoom}
              disabled={roomCodeInput.length !== 5 || multiplayer.loading}
              className="border-2 border-primary text-primary font-sans font-semibold px-5 py-2 rounded-full text-sm hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              data-testid="join-room-button"
            >
              {multiplayer.loading ? "Joining..." : "Join"}
            </button>
          </div>
          
          {multiplayer.error && (
            <p className="font-sans text-xs text-rose-500">{multiplayer.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}