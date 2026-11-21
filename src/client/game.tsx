import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GameScreen } from "./components/GameScreen";
import { ErrorBoundary } from "./components/ErrorBoundary";

export const App = () => {
  return (
    <div className="h-full w-full">
      <ErrorBoundary>
        <GameScreen />
      </ErrorBoundary>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);