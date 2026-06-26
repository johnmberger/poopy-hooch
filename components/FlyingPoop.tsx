"use client";

import { useEffect, useState } from "react";

interface Poop {
  id: number;
  duration: number;
  size: number;
  rotation: number;
  rise: number;
}

interface FlyingPoopProps {
  active: boolean;
}

const MAX_POOPS = 3;

export function FlyingPoop({ active }: FlyingPoopProps) {
  const [poops, setPoops] = useState<Poop[]>([]);
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOk(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!active) {
      setPoops([]);
    }
  }, [active]);

  useEffect(() => {
    if (!active || !motionOk) return;

    let cancelled = false;
    let idCounter = 0;
    let spawnCount = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const spawn = () => {
      if (spawnCount >= MAX_POOPS) return;
      spawnCount += 1;

      const poop: Poop = {
        id: idCounter++,
        duration: 4.5 + Math.random() * 2.5,
        size: 1.1 + Math.random() * 0.7,
        rotation: -15 + Math.random() * 30,
        rise: 75 + Math.random() * 20,
      };
      setPoops((prev) => [...prev, poop]);
    };

    const schedule = () => {
      if (cancelled || spawnCount >= MAX_POOPS) return;
      const delay = 6000 + Math.random() * 8000;
      timeoutId = setTimeout(() => {
        spawn();
        schedule();
      }, delay);
    };

    timeoutId = setTimeout(() => {
      spawn();
      schedule();
    }, 2000 + Math.random() * 3000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [active, motionOk]);

  if (!active || !motionOk) return null;

  return (
    <div className="flying-poop-layer" aria-hidden="true">
      {poops.map((poop) => (
        <span
          key={poop.id}
          className="flying-poop"
          style={{
            animationDuration: `${poop.duration}s`,
            fontSize: `${poop.size}rem`,
            ["--poop-rotation" as string]: `${poop.rotation}deg`,
            ["--poop-rise" as string]: `${poop.rise}vh`,
          }}
          onAnimationEnd={() => setPoops((prev) => prev.filter((p) => p.id !== poop.id))}
        >
          💩
        </span>
      ))}
    </div>
  );
}
