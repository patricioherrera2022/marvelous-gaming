"use client";

import React from "react";

export function BarcodeSvg({
  value,
  height = 44,
}: {
  value: string;
  height?: number;
}) {
  const clean = (value || "MG-000000").toUpperCase();
  const bars: Array<{ x: number; w: number }> = [];
  let cursor = 4;

  // Start guard
  bars.push({ x: cursor, w: 2 }, { x: cursor + 4, w: 1 });
  cursor += 8;

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const pattern = [
      ((code >> 0) & 1) + 1,
      ((code >> 1) & 1) + 1,
      ((code >> 2) & 1) + 1,
      ((code >> 3) & 1) + 1,
      ((code >> 4) & 1) + 1,
      ((code >> 5) & 1) + 1,
    ];
    for (let j = 0; j < pattern.length; j++) {
      const width = pattern[j];
      if (j % 2 === 0) {
        bars.push({ x: cursor, w: width });
      }
      cursor += width + 1;
    }
  }

  // Stop guard
  bars.push({ x: cursor, w: 1 }, { x: cursor + 3, w: 2 });
  cursor += 9;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${cursor} ${height}`}
        className="w-full max-w-[260px]"
        style={{ height }}
        aria-label={`Código de barras ${clean}`}
      >
        <rect x={0} y={0} width={cursor} height={height} fill="#ffffff" />
        {bars.map((b, idx) => (
          <rect
            key={idx}
            x={b.x}
            y={2}
            width={b.w}
            height={height - 4}
            fill="#000000"
          />
        ))}
      </svg>
      <span className="mt-1 font-mono text-[11px] font-bold tracking-[0.22em] text-black">
        {clean}
      </span>
    </div>
  );
}
