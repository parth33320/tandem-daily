import "./index.css";

import { navigateTo, requestExpandedMode } from "@devvit/web/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

export const Splash = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full bg-white dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-3xl">🀄</span>
            <span className="text-3xl">🈯</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Tandem Daily</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Chinese × Japanese Word Game</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Spot the false friends — words that look the same but mean different things</p>
          <button
            className="w-full py-3 px-6 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
            onClick={(e) => requestExpandedMode(e.nativeEvent, "game")}
          >
            Play Today's 5 Cards
          </button>
        </div>
      </div>
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 text-[0.7em] text-gray-500 dark:text-gray-400 mt-6">
        <button className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => navigateTo("https://developers.reddit.com/docs")}>
          Docs
        </button>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <button className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => navigateTo("https://www.reddit.com/r/Devvit")}>
          r/Devvit
        </button>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <button className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => navigateTo("https://discord.com/invite/R7yu2wh9Qz")}>
          Discord
        </button>
      </footer>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);