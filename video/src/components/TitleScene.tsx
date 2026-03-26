import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { COLORS, FONT } from "../styles/theme";

export const TITLE_DUR = 120;

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200 } });
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 200 },
  });
  const subY = interpolate(subProgress, [0, 1], [25, 0]);
  const subOpacity = interpolate(subProgress, [0, 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  const blurbProgress = spring({
    frame: frame - 45,
    fps,
    config: { damping: 200 },
  });
  const blurbY = interpolate(blurbProgress, [0, 1], [20, 0]);
  const blurbOpacity = interpolate(blurbProgress, [0, 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [TITLE_DUR - 30, TITLE_DUR - 10], [1, 0], {
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
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontFamily: FONT.sans,
            color: COLORS.teal,
            letterSpacing: 3,
            textTransform: "uppercase" as const,
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
          }}
        >
          🤖 Live Demo · Three Rivers Bank
        </div>

        <div
          style={{
            fontSize: 110,
            fontWeight: 700,
            fontFamily: FONT.sans,
            letterSpacing: -2,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: "center",
            lineHeight: 1.05,
          }}
        >
          <span style={{ color: COLORS.accent }}>Agentic</span>
          <br />
          <span style={{ color: COLORS.brightWhite }}>DevOps</span>
        </div>

        <div
          style={{
            fontSize: 30,
            fontFamily: FONT.sans,
            color: COLORS.dimWhite,
            maxWidth: 900,
            textAlign: "center",
            lineHeight: 1.5,
            opacity: blurbOpacity,
            transform: `translateY(${blurbY}px)`,
          }}
        >
          A full-stack demo app built, deployed, and operated entirely by AI
          agents — from first line of code to autonomous incident response.
        </div>
      </div>
    </AbsoluteFill>
  );
};
