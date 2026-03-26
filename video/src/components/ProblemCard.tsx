import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { COLORS, FONT } from "../styles/theme";

const DURATION = 215;

// Visual hierarchy: hook (big) → context (lighter) → punchline (accented) → kicker
const LINE_STYLES: Array<{
  fontSize: number;
  fontWeight: number;
  color: string;
}> = [
  { fontSize: 52, fontWeight: 700, color: COLORS.brightWhite }, // hook
  { fontSize: 36, fontWeight: 500, color: COLORS.dimWhite },    // context
  { fontSize: 36, fontWeight: 500, color: COLORS.dimWhite },    // context
  { fontSize: 40, fontWeight: 700, color: COLORS.cyan },        // punchline
];

const LINES = [
  "One repo. 30 developers.",
  "No one has the same Agent config.",
  "Shared by copy-paste. Never reviewed.",
  "Some devs get 10× gains. Others, none.",
];
const SUBTITLE = "There's no package.json for agent configuration.";

export const ProblemCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Graceful exit before transition overlap
  const fadeOut = interpolate(frame, [DURATION - 35, DURATION - 20], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
        }}
      >
        {LINES.map((line, i) => {
          const delay = i * 30;
          const progress = spring({
            frame: frame - delay,
            fps,
            config: { damping: 200 },
          });
          const y = interpolate(progress, [0, 1], [28, 0]);
          const opacity = interpolate(progress, [0, 0.6], [0, 1], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                fontSize: LINE_STYLES[i].fontSize,
                fontWeight: LINE_STYLES[i].fontWeight,
                fontFamily: FONT.sans,
                color: LINE_STYLES[i].color,
                transform: `translateY(${y}px)`,
                opacity,
                textAlign: "center",
              }}
            >
              {line}
            </div>
          );
        })}

        {/* Subtitle */}
        {(() => {
          const subProgress = spring({
            frame: frame - 115,
            fps,
            config: { damping: 200 },
          });
          const subY = interpolate(subProgress, [0, 1], [18, 0]);
          const subOpacity = interpolate(subProgress, [0, 0.6], [0, 1], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              style={{
                fontSize: 30,
                fontFamily: FONT.sans,
                fontWeight: 400,
                color: COLORS.cyan,
                marginTop: 10,
                opacity: subOpacity,
                transform: `translateY(${subY}px)`,
              }}
            >
              {SUBTITLE}
            </div>
          );
        })()}
      </div>
    </AbsoluteFill>
  );
};
