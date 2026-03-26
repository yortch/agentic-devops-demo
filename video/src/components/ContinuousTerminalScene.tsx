import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { COLORS, FONT, TIMING } from "../styles/theme";
import { TerminalLine } from "./TerminalLine";
import type { Scene } from "../data/scenes";

const READING_PAUSE = 65;
const CLEAR_FRAMES = 12;
const HEADER_GAP = 8;

interface PhaseInfo {
  scene: Scene;
  startFrame: number;
  contentEnd: number;
  clearStart: number;
  clearEnd: number;
  lineStarts: number[];
}

const computeLineStarts = (scene: Scene): number[] => {
  const starts: number[] = [];
  let cursor = 0;
  for (const line of scene.lines) {
    starts.push(cursor);
    if (line.type === "command") {
      cursor += line.text.length * TIMING.CHAR_DELAY + TIMING.COMMAND_PAUSE;
    } else if (line.type === "blank") {
      cursor += TIMING.LINE_DELAY;
    } else if (line.type === "banner") {
      cursor += TIMING.LINE_DELAY * 4;
    } else {
      cursor += TIMING.LINE_DELAY;
    }
  }
  return starts;
};

const computeContentEnd = (scene: Scene): number => {
  const starts = computeLineStarts(scene);
  const lastLine = scene.lines[scene.lines.length - 1];
  const lastStart = starts[starts.length - 1];
  if (lastLine.type === "command") {
    return lastStart + lastLine.text.length * TIMING.CHAR_DELAY + TIMING.COMMAND_PAUSE;
  }
  return lastStart + TIMING.LINE_DELAY;
};

function buildPhases(scenes: Scene[]): PhaseInfo[] {
  const phases: PhaseInfo[] = [];
  let cursor = 0;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const lineStarts = computeLineStarts(scene);
    const contentDur = computeContentEnd(scene);
    const startFrame = cursor;
    const contentEnd = startFrame + contentDur;
    const clearStart = contentEnd + READING_PAUSE;
    const clearEnd = clearStart + CLEAR_FRAMES;

    phases.push({ scene, startFrame, contentEnd, clearStart, clearEnd, lineStarts });

    if (i < scenes.length - 1) {
      cursor = clearEnd + HEADER_GAP;
    }
  }

  return phases;
}

/** Compute total duration needed. Use this in Composition.tsx for the Sequence. */
export function computeContinuousDuration(
  scenes: Scene[],
  postReading = 80,
): number {
  const phases = buildPhases(scenes);
  const last = phases[phases.length - 1];
  return last.contentEnd + postReading + 35;
}

interface ContinuousTerminalSceneProps {
  scenes: Scene[];
  totalDuration: number;
}

export const ContinuousTerminalScene: React.FC<ContinuousTerminalSceneProps> = ({
  scenes,
  totalDuration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phases = buildPhases(scenes);

  // Terminal entrance
  const entrance = spring({ frame, fps, config: { damping: 200 } });
  const rotateX = interpolate(entrance, [0, 1], [4, 0]);
  const translateYVal = interpolate(entrance, [0, 1], [24, 0]);
  const termScale = interpolate(entrance, [0, 1], [0.96, 1]);
  const termOpacity = interpolate(entrance, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Terminal exit before scene transition
  const fadeOut = interpolate(
    frame,
    [totalDuration - 35, totalDuration - 20],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    },
  );

  return (
    <AbsoluteFill>
      {/* Headers — one per phase, cross-fading */}
      {phases.map((phase, i) => {
        if (!phase.scene.header) return null;

        const headerEnd =
          i < phases.length - 1
            ? phases[i + 1].startFrame - HEADER_GAP
            : totalDuration - TIMING.TRANSITION_FRAMES - 5;

        if (frame < phase.startFrame - 5 || frame > headerEnd + 15) return null;

        const hookProgress = spring({
          frame: frame - phase.startFrame,
          fps,
          config: { damping: 200 },
        });
        const hookY = interpolate(hookProgress, [0, 1], [24, 0]);
        const hookOpacity = interpolate(hookProgress, [0, 0.5], [0, 1], {
          extrapolateRight: "clamp",
        });

        const subProgress = spring({
          frame: frame - phase.startFrame - 12,
          fps,
          config: { damping: 200 },
        });
        const subY = interpolate(subProgress, [0, 1], [16, 0]);
        const subOpacity = interpolate(subProgress, [0, 0.5], [0, 1], {
          extrapolateRight: "clamp",
        });

        const headerFadeOut = interpolate(
          frame,
          [headerEnd, headerEnd + 10],
          [1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.quad),
          },
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 35,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              opacity: headerFadeOut,
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 600,
                fontFamily: FONT.sans,
                color: COLORS.brightWhite,
                letterSpacing: -0.5,
                transform: `translateY(${hookY}px)`,
                opacity: hookOpacity,
              }}
            >
              {phase.scene.header.hook}
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 500,
                fontFamily: FONT.sans,
                color: COLORS.brightWhite,
                opacity: subOpacity,
                transform: `translateY(${subY}px)`,
                textAlign: "center",
                maxWidth: "90%",
              }}
            >
              {phase.scene.header.subtitle}
            </div>
          </div>
        );
      })}

      {/* Persistent terminal window */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) perspective(1200px) rotateX(${rotateX}deg) translateY(${translateYVal}px) scale(${termScale})`,
          marginTop: 45,
          width: "92%",
          maxHeight: "72%",
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
            (color, idx) => (
              <div
                key={idx}
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

        {/* Terminal content — phases render and clear sequentially */}
        <div
          style={{
            backgroundColor: COLORS.terminalBg,
            padding: "20px 20px",
            flex: 1,
            minHeight: 280,
          }}
        >
          {phases.map((phase, i) => {
            const localFrame = frame - phase.startFrame;
            const isStarted = localFrame >= 0;
            const isCleared = i < phases.length - 1 && frame >= phase.clearEnd;

            if (!isStarted || isCleared) return null;

            const clearOpacity =
              i < phases.length - 1
                ? interpolate(
                    frame,
                    [phase.clearStart, phase.clearEnd],
                    [1, 0],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.out(Easing.quad),
                    },
                  )
                : 1;

            return (
              <div key={i} style={{ opacity: clearOpacity }}>
                {phase.scene.lines.map((line, j) => (
                  <TerminalLine
                    key={`${i}-${j}`}
                    line={line}
                    startFrame={phase.startFrame + phase.lineStarts[j]}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
