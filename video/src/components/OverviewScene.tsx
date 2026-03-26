import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { COLORS, FONT } from "../styles/theme";

export const OVERVIEW_DUR = 210;

const TOOLS = [
  {
    icon: "✨",
    name: "GitHub Copilot",
    badge: "IDE Assistant",
    badgeColor: COLORS.blue,
    desc: "Inline completions and chat powered every file — from Spring Boot entities to React components to Terraform modules.",
  },
  {
    icon: "🖥️",
    name: "Copilot CLI",
    badge: "Terminal Intelligence",
    badgeColor: COLORS.purple,
    desc: "Drove infrastructure, troubleshot deployments, and orchestrated Azure SRE Agent setup — all from the terminal.",
  },
  {
    icon: "🤖",
    name: "Copilot Coding Agent",
    badge: "Autonomous Developer",
    badgeColor: COLORS.teal,
    desc: "Reads SRE Agent issues, performs code analysis, implements targeted fixes, and opens PRs — autonomously.",
  },
];

export const OverviewScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerProgress = spring({ frame, fps, config: { damping: 200 } });
  const headerY = interpolate(headerProgress, [0, 1], [30, 0]);
  const headerOpacity = interpolate(headerProgress, [0, 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(
    frame,
    [OVERVIEW_DUR - 30, OVERVIEW_DUR - 10],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
        padding: "0 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
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
            Development
          </div>
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              fontFamily: FONT.sans,
              color: COLORS.brightWhite,
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            Built <span style={{ color: COLORS.accent }}>entirely</span>
            <br />
            with GitHub Copilot
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 32,
            width: "100%",
            justifyContent: "center",
          }}
        >
          {TOOLS.map((tool, i) => {
            const cardProgress = spring({
              frame: frame - 30 - i * 15,
              fps,
              config: { damping: 200 },
            });
            const cardY = interpolate(cardProgress, [0, 1], [40, 0]);
            const cardOpacity = interpolate(cardProgress, [0, 0.6], [0, 1], {
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  maxWidth: 340,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${tool.badgeColor}33`,
                  borderRadius: 16,
                  padding: "32px 28px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  opacity: cardOpacity,
                  transform: `translateY(${cardY}px)`,
                }}
              >
                <div style={{ fontSize: 44 }}>{tool.icon}</div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    fontFamily: FONT.sans,
                    color: COLORS.brightWhite,
                  }}
                >
                  {tool.name}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontFamily: FONT.sans,
                    color: tool.badgeColor,
                    backgroundColor: `${tool.badgeColor}15`,
                    border: `1px solid ${tool.badgeColor}30`,
                    borderRadius: 20,
                    padding: "4px 14px",
                    letterSpacing: 0.5,
                  }}
                >
                  {tool.badge}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontFamily: FONT.sans,
                    color: COLORS.dimWhite,
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  {tool.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
