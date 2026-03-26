import React from "react";
import { COLORS } from "../styles/theme";

interface MicrosoftLogoProps {
  size?: number;
}

/**
 * Microsoft 4-square logo rendered as pure CSS grid.
 * No external assets needed.
 */
export const MicrosoftLogo: React.FC<MicrosoftLogoProps> = ({ size = 32 }) => {
  const squareSize = (size - 3) / 2; // account for gap
  const gap = 3;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${squareSize}px ${squareSize}px`,
        gridTemplateRows: `${squareSize}px ${squareSize}px`,
        gap,
        width: size,
        height: size,
      }}
    >
      <div style={{ backgroundColor: COLORS.msRed }} />
      <div style={{ backgroundColor: COLORS.msGreen }} />
      <div style={{ backgroundColor: COLORS.msBlue }} />
      <div style={{ backgroundColor: COLORS.msYellow }} />
    </div>
  );
};
