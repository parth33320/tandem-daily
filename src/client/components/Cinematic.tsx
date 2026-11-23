import React from "react";
import { motion, type MotionStyle } from "framer-motion";

interface CinematicProps {
  tension?: boolean;
}

export function Cinematic({ tension = false }: CinematicProps) {
  return (
    <>
      <motion.div
        className="cine-vignette"
        animate={tension ? { scale: 1.02 } : {}}
        transition={{ duration: 0.15 }}
      />
      <div className="cine-haze" />
      <div className="cine-grain" />
      <CinematicSpot />
    </>
  );
}

function CinematicSpot() {
  const [mousePos, setMousePos] = React.useState({ x: "50%", y: "50%" });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = `${(e.clientX / window.innerWidth) * 100}%`;
      const y = `${(e.clientY / window.innerHeight) * 100}%`;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.div
      className="cine-spot"
      style={{ "--mouse-x": mousePos.x, "--mouse-y": mousePos.y } as unknown as MotionStyle}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}