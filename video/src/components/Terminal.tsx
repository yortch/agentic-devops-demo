import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { COLORS, FONT, TIMING } from "../styles/theme";
import { TerminalLine } from "./TerminalLine";
import type { Scene } from "../data/scenes";

interface TerminalProps {
  scene: Scene;
  /** Whether a scene header is displayed above */
  hasHeader?: boolean;
}

/**
 * Calculate the start frame for each line within a scene.
 * Commands use typewriter timing; output/blank lines are sequential.
 */
const computeLineStartFrames = (scene: Scene): number[] => {
  const starts: number[] = [];
  let cursor = 0;

  for (const line of scene.lines) {
    starts.push(cursor);
    if (line.type === "command") {
      cursor += line.text.length * TIMING.CHAR_DELAY + TIMING.COMMAND_PAUSE;
    } else if (line.type === "blank") {
      cursor += TIMING.LINE_DELAY;
    } else if (line.type === "banner") {
      // Banner image needs more display time than a text line
      cursor += TIMING.LINE_DELAY * 4;
    } else {
      cursor += TIMING.LINE_DELAY;
    }
  }

  return starts;
};

export const Terminal: React.FC<TerminalProps> = ({ scene, hasHeader }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lineStarts = computeLineStartFrames(scene);

  // Confident entrance — gentle perspective settle, no bounce
  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const rotateX = interpolate(entrance, [0, 1], [4, 0]);
  const translateY = interpolate(entrance, [0, 1], [24, 0]);
  const termScale = interpolate(entrance, [0, 1], [0.96, 1]);
  const termOpacity = interpolate(entrance, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Graceful exit before transition overlap
  const dur = scene.durationFrames;
  const fadeOut = interpolate(
    frame,
    [dur - 35, dur - 20],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    },
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) perspective(1200px) rotateX(${rotateX}deg) translateY(${translateY}px) scale(${termScale})`,
        marginTop: hasHeader ? 45 : 0,
        width: "92%",
        maxHeight: hasHeader ? "72%" : "78%",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow:
          "0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.03)",
        opacity: termOpacity * fadeOut,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          backgroundColor: COLORS.terminalBar,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {[COLORS.trafficRed, COLORS.trafficYellow, COLORS.trafficGreen].map(
          (color, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: color,
              }}
            />
          ),
        )}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: FONT.sans,
            fontSize: 13,
            color: COLORS.dimWhite,
            marginRight: 50,
          }}
        >
          ~/projects/my-app — zsh
        </div>
      </div>

      {/* Terminal content */}
      <div
        style={{
          backgroundColor: COLORS.terminalBg,
          padding: "20px 20px",
          flex: 1,
          minHeight: 280,
        }}
      >
        {scene.lines.map((line, i) => (
          <TerminalLine key={i} line={line} startFrame={lineStarts[i]} />
        ))}
      </div>
    </div>
  );
};
