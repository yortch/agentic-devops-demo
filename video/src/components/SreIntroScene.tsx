import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { COLORS, FONT } from "../styles/theme";

export const SRE_INTRO_DUR = 180;

const FEATURES = [
  { icon: "📡", label: "Monitors Azure Container Apps 24/7" },
  { icon: "🔍", label: "KQL log analysis & metric correlation" },
  { icon: "📋", label: "Auto-creates GitHub Issues with full RCA" },
  { icon: "🔗", label: "Triggers Copilot Coding Agent for fixes" },
];

export const SreIntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200 } });
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(
    frame,
    [SRE_INTRO_DUR - 30, SRE_INTRO_DUR - 10],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
        padding: "0 120px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontFamily: FONT.sans,
              color: COLORS.teal,
              letterSpacing: 3,
              textTransform: "uppercase" as const,
            }}
          >
            Azure SRE Agent
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              fontFamily: FONT.sans,
              color: COLORS.brightWhite,
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            The SRE That{" "}
            <span style={{ color: COLORS.accent }}>Never Sleeps</span>
          </div>
          <div
            style={{
              fontSize: 24,
              fontFamily: FONT.sans,
              color: COLORS.dimWhite,
              textAlign: "center",
              maxWidth: 750,
              lineHeight: 1.5,
              marginTop: 4,
            }}
          >
            Autonomous incident detection, investigation, and remediation —
            root cause analysis in under 2 minutes.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            width: "100%",
            maxWidth: 660,
          }}
        >
          {FEATURES.map((f, i) => {
            const featureProgress = spring({
              frame: frame - 35 - i * 12,
              fps,
              config: { damping: 200 },
            });
            const featureX = interpolate(featureProgress, [0, 1], [40, 0]);
            const featureOpacity = interpolate(
              featureProgress,
              [0, 0.6],
              [0, 1],
              { extrapolateRight: "clamp" },
            );

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${COLORS.gray}`,
                  borderRadius: 12,
                  padding: "16px 24px",
                  opacity: featureOpacity,
                  transform: `translateX(${featureX}px)`,
                }}
              >
                <div style={{ fontSize: 32 }}>{f.icon}</div>
                <div
                  style={{
                    fontSize: 24,
                    fontFamily: FONT.sans,
                    color: COLORS.white,
                  }}
                >
                  {f.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
