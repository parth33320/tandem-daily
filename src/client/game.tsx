import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GameScreen } from "./components/GameScreen";

export const App = () => {
  return (
    <div className="h-full w-full">
      <GameScreen />
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);