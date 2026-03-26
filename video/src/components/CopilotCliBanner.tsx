import React from "react";
import { COLORS, FONT } from "../styles/theme";

// Pixel data for each letter (5 rows, variable width)
// 1 = filled pixel, 0 = empty
const LETTERS: Record<string, number[][]> = {
  C: [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1],
  ],
  O: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  P: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  I: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  L: [
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
  ],
  T: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
};

const WORD = ["C", "O", "P", "I", "L", "O", "T"];
const PX = 10; // pixel size
const GAP = 10; // gap between letters

const PixelLetter: React.FC<{ letter: string; color: string }> = ({
  letter,
  color,
}) => {
  const grid = LETTERS[letter];
  if (!grid) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {grid.map((row, r) => (
        <div key={r} style={{ display: "flex", gap: 2 }}>
          {row.map((cell, c) => (
            <div
              key={c}
              style={{
                width: PX,
                height: PX,
                borderRadius: 2,
                backgroundColor: cell ? color : "transparent",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CopilotCliBanner: React.FC = () => {
  return (
    <div
      style={{
        border: `1px solid ${COLORS.dimWhite}40`,
        borderRadius: 6,
        padding: "12px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
        margin: "4px 0",
      }}
    >
      <div
        style={{
          fontFamily: FONT.sans,
          fontSize: 13,
          color: COLORS.dimWhite,
          letterSpacing: 0.5,
        }}
      >
        Welcome to GitHub
      </div>

      {/* COPILOT pixel art */}
      <div style={{ display: "flex", alignItems: "center", gap: GAP }}>
        {WORD.map((letter, i) => (
          <PixelLetter key={i} letter={letter} color={COLORS.cyan} />
        ))}
      </div>

      <div
        style={{
          fontFamily: FONT.sans,
          fontSize: 12,
          color: COLORS.dimWhite,
          alignSelf: "flex-end",
        }}
      >
        CLI Version
      </div>
    </div>
  );
};
