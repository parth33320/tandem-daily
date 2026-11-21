import { useState, useEffect } from "react";
import { HandCursor } from "./HandCursor";
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

  const handleStart = (dir: Direction) => {
    setDirection(dir);
    game.startGame();
    sound.playCardSwoosh();
  };

  const handleSelect = (idx: number) => {
    game.selectAnswer(idx);
  };

  const handleHint = (hint: "eliminate" | "example" | "category") => {
    game.useHint(hint);
    sound.playTickSound();
  };

  const handlePlayAgain = () => {
    game.fetchDaily();
    setDirection("zh2ja");
  };

  if (game.loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-600 border-t-transparent"></div>
      </div>
    );
  }

  if (game.error) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center">
        <p className="text-red-600 dark:text-red-400">{game.error}</p>
      </div>
    );
  }

  if (!game.daily) {
    return null;
  }

  const currentCard = game.daily.cards[game.currentCard];

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white dark:bg-gray-900">
      <HandCursor />
      {game.phase === "start" && (
        <StartScreen puzzleNumber={game.daily.puzzleNumber} onStart={handleStart} disabled={game.daily.alreadyPlayed} />
      )}
      {game.phase === "playing" && currentCard && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3 overflow-hidden">
          <CardView
            card={currentCard}
            direction={direction}
            showReading={game.showReading}
            onEliminate={() => handleHint("eliminate")}
            onShowReading={() => handleHint("example")}
            canEliminate={!game.usedHints.includes("eliminate")}
            canShowReading={!game.usedHints.includes("example")}
          />
          <ChoiceButtons
            card={currentCard}
            direction={direction}
            eliminated={game.eliminated}
            onSelect={handleSelect}
            disabled={game.revealed}
            stats={game.daily.stats?.[`card_${game.currentCard}`]}
          />
        </div>
      )}
      {game.phase === "playing" && game.revealed && currentCard && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3 overflow-hidden">
          <RevealView
            card={currentCard}
            selectedIdx={game.answers[game.answers.length - 1]?.choiceIdx ?? -1}
            correct={game.answers[game.answers.length - 1]?.correct ?? false}
            stats={game.daily.stats?.[`card_${game.currentCard}`]}
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
          onShare={() => {
            game.submitScore();
            game.shareScore();
          }}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}