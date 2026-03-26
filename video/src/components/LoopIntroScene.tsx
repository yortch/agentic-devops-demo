import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { COLORS, FONT } from "../styles/theme";

export const LOOP_INTRO_DUR = 90;

export const LoopIntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelProgress = spring({ frame, fps, config: { damping: 200 } });
  const labelOpacity = interpolate(labelProgress, [0, 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  const descProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 200 },
  });
  const descOpacity = interpolate(descProgress, [0, 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(
    frame,
    [LOOP_INTRO_DUR - 25, LOOP_INTRO_DUR - 8],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
  );

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
          gap: 14,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontFamily: FONT.sans,
            color: COLORS.teal,
            letterSpacing: 3,
            textTransform: "uppercase" as const,
            opacity: labelOpacity,
          }}
        >
          The Heart of Agentic DevOps
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            fontFamily: FONT.sans,
            color: COLORS.brightWhite,
            textAlign: "center",
            lineHeight: 1.15,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          From Defect to Fix —
          <br />
          <span style={{ color: COLORS.accent }}>
            Zero Human Intervention
          </span>
        </div>
        <div
          style={{
            fontSize: 26,
            fontFamily: FONT.sans,
            color: COLORS.dimWhite,
            textAlign: "center",
            maxWidth: 750,
            lineHeight: 1.5,
            opacity: descOpacity,
          }}
        >
          chaos → detection → RCA → fix → recovery
        </div>
      </div>
    </AbsoluteFill>
  );
};
