"use client";

import { useEffect, useRef, useState } from "react";

interface Poop {
  duration: number;
  size: number;
  rotation: number;
  rise: number;
}

interface FlyingPoopProps {
  active: boolean;
}

const SPAWN_DELAY_MS = 10_000;

export function FlyingPoop({ active }: FlyingPoopProps) {
  const [poop, setPoop] = useState<Poop | null>(null);
  const [motionOk, setMotionOk] = useState(false);
  const hasScheduledRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOk(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!active || !motionOk || hasScheduledRef.current) return;

    hasScheduledRef.current = true;
    const timeoutId = setTimeout(() => {
      setPoop({
        duration: 4.5 + Math.random() * 2.5,
        size: 1.1 + Math.random() * 0.7,
        rotation: -15 + Math.random() * 30,
        rise: 75 + Math.random() * 20,
      });
    }, SPAWN_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [active, motionOk]);

  if (!active || !motionOk || !poop) return null;

  return (
    <div className="flying-poop-layer" aria-hidden="true">
      <span
        className="flying-poop"
        style={{
          animationDuration: `${poop.duration}s`,
          fontSize: `${poop.size}rem`,
          ["--poop-rotation" as string]: `${poop.rotation}deg`,
          ["--poop-rise" as string]: `${poop.rise}vh`,
        }}
        onAnimationEnd={() => setPoop(null)}
      >
        💩
      </span>
    </div>
  );
}
