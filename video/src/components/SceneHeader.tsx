import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { COLORS, FONT, TIMING } from "../styles/theme";
import type { SceneHeader as SceneHeaderData } from "../data/scenes";

interface SceneHeaderProps {
  header: SceneHeaderData;
  sceneDuration: number;
}

export const SceneHeader: React.FC<SceneHeaderProps> = ({
  header,
  sceneDuration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth, confident entrance — no bounce
  const hookProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const hookY = interpolate(hookProgress, [0, 1], [24, 0]);
  const hookOpacity = interpolate(hookProgress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subProgress = spring({
    frame: frame - 12,
    fps,
    config: { damping: 200 },
  });
  const subY = interpolate(subProgress, [0, 1], [16, 0]);
  const subtitleOpacity = interpolate(subProgress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Smooth fade out
  const fadeOutStart = sceneDuration - TIMING.TRANSITION_FRAMES - 5;
  const fadeOut = interpolate(
    frame,
    [fadeOutStart, fadeOutStart + 10],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 35,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        opacity: fadeOut,
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontSize: 42,
          fontWeight: 600,
          fontFamily: FONT.sans,
          color: COLORS.brightWhite,
          letterSpacing: -0.5,
          transform: `translateY(${hookY}px)`,
          opacity: hookOpacity,
        }}
      >
        {header.hook}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 500,
          fontFamily: FONT.sans,
          color: COLORS.brightWhite,
          opacity: subtitleOpacity,
          transform: `translateY(${subY}px)`,
          textAlign: "center",
          maxWidth: "90%",
        }}
      >
        {header.subtitle}
      </div>
    </div>
  );
};
