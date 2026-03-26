import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { COLORS, FONT } from "../styles/theme";

const DURATION = 170;

const SETUP = [
  "One repo. Copilot, Claude, Cursor.",
  "Same config. Every developer.",
];
const RESOLUTION = "All versioned. All reviewed.";
const SUBTITLE =
  "Reproducible, auditable and portable\u2009—\u2009locally and on the cloud.";

export const ResolutionCard: React.FC = () => {
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
        {SETUP.map((line, i) => {
          const delay = i * 28;
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
                fontSize: 44,
                fontWeight: 700,
                fontFamily: FONT.sans,
                color: COLORS.brightWhite,
                transform: `translateY(${y}px)`,
                opacity,
                textAlign: "center",
              }}
            >
              {line}
            </div>
          );
        })}

        {/* Resolution */}
        {(() => {
          const resProgress = spring({
            frame: frame - 58,
            fps,
            config: { damping: 200 },
          });
          const resY = interpolate(resProgress, [0, 1], [22, 0]);
          const resOpacity = interpolate(resProgress, [0, 0.6], [0, 1], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                fontFamily: FONT.sans,
                color: COLORS.cyan,
                marginTop: 4,
                opacity: resOpacity,
                transform: `translateY(${resY}px)`,
              }}
            >
              {RESOLUTION}
            </div>
          );
        })()}

        {/* Subtitle */}
        {(() => {
          const subProgress = spring({
            frame: frame - 85,
            fps,
            config: { damping: 200 },
          });
          const subY = interpolate(subProgress, [0, 1], [16, 0]);
          const subOpacity = interpolate(subProgress, [0, 0.6], [0, 1], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              style={{
                fontSize: 30,
                fontWeight: 500,
                fontFamily: FONT.sans,
                color: COLORS.brightWhite,
                textAlign: "center",
                maxWidth: "88%",
                lineHeight: 1.5,
                marginTop: 6,
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
