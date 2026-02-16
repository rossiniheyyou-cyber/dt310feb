"use client";

import { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  onComplete: () => void;
};

export default function HappyLearningAnimation({ isOpen, onComplete }: Props) {
  const [phase, setPhase] = useState<"entering" | "flying" | "exiting">("entering");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMounted(true);
    setPhase("entering");
    const t1 = setTimeout(() => setPhase("flying"), 200);
    const t2 = setTimeout(() => setPhase("exiting"), 17200);
    const t3 = setTimeout(() => {
      onComplete();
      setMounted(false);
    }, 17500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen, onComplete]);

  if (!isOpen || !mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden pointer-events-none"
      style={{ background: "transparent" }}
      aria-hidden
    >
      {/* Rocket - flies left to right across current page; transparent, large, slow */}
      <div
        className="absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center"
        style={{
          width: "min(85vw, 480px)",
          height: "min(85vw, 480px)",
          left: phase === "entering" ? "-20%" : phase === "flying" ? "120%" : "120%",
          opacity: phase === "exiting" ? 0 : 1,
          transition:
            phase === "flying"
              ? "left 15s cubic-bezier(0.22, 0.61, 0.36, 1)"
              : "opacity 0.3s ease",
        }}
      >
        <img
          src="/images/rocket-happy-learning.png"
          alt=""
          className="w-full h-full object-contain select-none"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            boxShadow: "none",
            filter: "drop-shadow(0 0 16px rgba(14, 165, 233, 0.25))",
            mixBlendMode: "lighten",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
