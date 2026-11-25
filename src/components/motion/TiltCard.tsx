"use client";

import React, { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function TiltCard({
  children,
  className = "",
  maxTilt = 7,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50, hovered: false });

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * maxTilt * 2;
    const ry = (px - 0.5) * maxTilt * 2;
    setTilt({
      x: rx,
      y: ry,
      gx: Math.round(px * 100),
      gy: Math.round(py * 100),
      hovered: true,
    });
  };

  const handleLeave = () => {
    setTilt({ x: 0, y: 0, gx: 50, gy: 50, hovered: false });
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: tilt.hovered ? 1.018 : 1,
      }}
      transition={{ type: "spring", stiffness: 280, damping: 24, mass: 0.5 }}
      style={{ transformStyle: "preserve-3d", perspective: 900 }}
      className={`relative ${className}`}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: tilt.hovered ? 1 : 0,
          background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(239, 68, 68, 0.16), transparent 60%)`,
        }}
      />
    </motion.div>
  );
}
