import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, TIMING } from "../styles/theme";
import { CopilotCliBanner } from "./CopilotCliBanner";
import type { TerminalLine as TLine } from "../data/scenes";

const resolveColor = (colorKey?: string): string => {
  if (!colorKey) return COLORS.white;
  return (COLORS as Record<string, string>)[colorKey] ?? COLORS.white;
};

interface TerminalLineProps {
  line: TLine;
  startFrame: number;
}

export const TerminalLine: React.FC<TerminalLineProps> = ({
  line,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - startFrame;

  if (elapsed < 0) return null;

  if (line.type === "blank") {
    return <div style={{ height: 12 }} />;
  }

  if (line.type === "banner") {
    const bannerProgress = spring({
      frame: Math.max(0, elapsed),
      fps,
      config: { damping: 200 },
    });
    const bannerOpacity = interpolate(bannerProgress, [0, 0.6], [0, 1], {
      extrapolateRight: "clamp",
    });

    return (
      <div style={{ opacity: bannerOpacity }}>
        <CopilotCliBanner />
      </div>
    );
  }

  if (line.type === "command") {
    const totalChars = line.text.length;
    const charsVisible = Math.min(
      totalChars,
      Math.floor(elapsed / TIMING.CHAR_DELAY),
    );
    const visibleText = line.text.slice(0, charsVisible);
    const showCursor = charsVisible < totalChars;

    return (
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 22,
          lineHeight: "34px",
          whiteSpace: "pre",
          color: COLORS.green,
        }}
      >
        <span style={{ color: COLORS.vscodeBlue }}>❯ </span>
        <span>{visibleText}</span>
        {showCursor && (
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 20,
              backgroundColor: COLORS.cyan,
              marginLeft: 1,
              verticalAlign: "text-bottom",
              opacity: Math.sin(elapsed * 0.3) > 0 ? 1 : 0,
              borderRadius: 1,
            }}
          />
        )}
      </div>
    );
  }

  // Output lines — gentle slide from left with smooth spring
  const slideProgress = spring({
    frame: Math.max(0, elapsed),
    fps,
    config: { damping: 200 },
  });
  const slideX = interpolate(slideProgress, [0, 1], [-8, 0]);
  const slideOpacity = interpolate(slideProgress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: 20,
        lineHeight: "32px",
        whiteSpace: "pre",
        color: resolveColor(line.color),
        opacity: slideOpacity,
        transform: `translateX(${slideX}px)`,
      }}
    >
      {line.text}
    </div>
  );
};
