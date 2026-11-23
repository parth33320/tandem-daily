import React from "react";
import { motion } from "framer-motion";

interface RevealFlareProps {
  isVisible: boolean;
  type: "good" | "bad";
  onComplete?: () => void;
}

export function RevealFlare({ isVisible, type, onComplete }: RevealFlareProps) {
  React.useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      className={type === "good" ? "cine-flare-good" : "cine-flare-bad"}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1.1 }}
      exit={{ opacity: 0, scale: 1.5 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    />
  );
}