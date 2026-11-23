import { useState, useEffect, useRef } from "react";
import { StartScreen } from "./StartScreen";
import { CardView } from "./CardView";
import { ChoiceButtons } from "./ChoiceButtons";
import { RevealView } from "./RevealView";
import { EndScreen } from "./EndScreen";
import { useDailyGame } from "@/hooks/useDailyGame";
import { useSound } from "@/hooks/useSound";
import type { Direction } from "@/shared/api";

export function GameScreen() {
  const [direction, setDirection] = useState<Direction>("zh2ja");
  const game = useDailyGame(direction);
  const sound = useSound();
  const submittedRef = useRef(false);

  useEffect(() => {
    if (game.phase === "playing" && game.currentCard === 0) {
      sound.playCardSwoosh();
    }
  }, [game.currentCard, game.phase, sound]);

  useEffect(() => {
    if (game.revealed) {
      const currentCard = game.daily?.cards[game.currentCard];
      if (currentCard) {
        const selected = game.answers[game.answers.length - 1];
        if (selected?.correct) {
          sound.playCorrectSound();
        } else {
          sound.playWrongSound();
        }
      }
    }
  }, [game.revealed, game.answers, game.daily, game.currentCard, sound]);

  useEffect(() => {
    if (game.phase === "playing") {
      submittedRef.current = false;
    }
    if (game.phase === "ended" && !game.practiceMode && !submittedRef.current) {
      submittedRef.current = true;
      void game.submitScore();
    }
  }, [game.phase, game.practiceMode, game.submitScore]);

  const handleStart = (dir: Direction, practice = false) => {
    setDirection(dir);
    game.startGame(practice);
    sound.playCardSwoosh();
  };

  const handleSelect = (idx: number) => {
    void game.selectAnswer(idx);
  };

  const handleLifeline = (type: "fiftyFifty" | "xray" | "twentyQuestions" | "askSubreddit") => {
    game.useLifeline(type);
    sound.playTickSound();
  };

  const handlePlayAgain = () => {
    game.startGame(true);
    sound.playCardSwoosh();
  };

  const handleShare = (onStatus: (status: "loading" | "success" | "error", error?: string) => void) => {
    void game.submitScore();
    void game.shareScore(onStatus);
  };

  if (game.loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent"></div>
      </div>
    );
  }

  if (game.error) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center">
        <p className="text-crimson-light">{game.error}</p>
      </div>
    );
  }

  if (!game.daily) {
    return null;
  }

  const currentCard = game.daily.cards[game.currentCard];
  const cardStats = game.daily.stats?.[`card_${game.currentCard}`];

  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col">
      {game.phase === "start" && (
        <StartScreen
          puzzleNumber={game.daily.puzzleNumber}
          onStart={handleStart}
          alreadyPlayed={game.daily.alreadyPlayed}
        />
      )}
      {game.phase === "playing" && currentCard && !game.revealed && (
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center p-2.5 sm:p-4 gap-2">
          <CardView
            card={currentCard}
            direction={direction}
            timer={game.timer}
            timerEnabled={game.timerEnabled}
            onToggleTimer={game.toggleTimer}
            onFiftyFifty={() => handleLifeline("fiftyFifty")}
            onXRay={() => handleLifeline("xray")}
            onTwentyQuestions={() => handleLifeline("twentyQuestions")}
            onAskSubreddit={() => handleLifeline("askSubreddit")}
            canFiftyFifty={!game.lifelinesUsed.fiftyFifty}
            canXRay={!game.lifelinesUsed.xray && !!currentCard.word.radical}
            canTwentyQuestions={game.lifelinesUsed.twentyQuestions < 2}
            canAskSubreddit={!game.lifelinesUsed.askSubreddit}
            showRadicalOverlay={game.showRadicalOverlay}
            showClues={game.showClues}
            communityStats={cardStats}
            directionMode={direction}
          />
        </div>
      )}
      {game.phase === "playing" && currentCard && !game.revealed && (
        <div className="shrink-0 p-2.5 sm:p-4 pt-0">
          <ChoiceButtons
            card={currentCard}
            direction={direction}
            eliminatedIndices={game.eliminatedIndices}
            onSelect={handleSelect}
            disabled={game.revealed}
            stats={cardStats}
          />
        </div>
      )}
      {game.phase === "playing" && game.revealed && currentCard && (
        <div className="flex-1 flex flex-col items-center justify-center p-2.5 sm:p-4 gap-2 overflow-hidden">
          <RevealView
            card={currentCard}
            selectedIdx={game.answers[game.answers.length - 1]?.choiceIdx ?? -1}
            correct={game.answers[game.answers.length - 1]?.correct ?? false}
            stats={cardStats}
            directionMode={direction}
            onNext={game.nextCard}
            isLastCard={game.currentCard === 4}
          />
        </div>
      )}
      {game.phase === "ended" && (
        <EndScreen
          score={game.score}
          streak={game.daily.streak}
          answers={game.answers}
          daily={{
            puzzleNumber: game.daily.puzzleNumber,
            cards: game.daily.cards,
          }}
          onShare={handleShare}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}