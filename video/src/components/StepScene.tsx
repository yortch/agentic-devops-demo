import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { COLORS, FONT } from "../styles/theme";

export const STEP_DUR = 195;

interface StepSceneProps {
  stepNum: number;
  emoji: string;
  title: string;
  desc: string;
  actor: string;
  color: string;
  screenshot: string;
  duration?: number;
  /** When true, zooms in and slowly pans the screenshot top-to-bottom */
  panScroll?: boolean;
  /** Image height multiplier for panScroll (default 200% = "2"). Lower = more zoomed out. */
  panHeight?: string;
  /** Horizontal alignment for panScroll images: "center" (default) or "left" */
  panAlign?: "center" | "left";
}

export const StepScene: React.FC<StepSceneProps> = ({
  stepNum,
  emoji,
  title,
  desc,
  actor,
  color,
  screenshot,
  duration = STEP_DUR,
  panScroll = false,
  panHeight = "200%",
  panAlign = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Step badge animation
  const badgeProgress = spring({ frame, fps, config: { damping: 200 } });
  const badgeScale = interpolate(badgeProgress, [0, 1], [0.5, 1]);
  const badgeOpacity = interpolate(badgeProgress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Text animation
  const textProgress = spring({
    frame: frame - 8,
    fps,
    config: { damping: 200 },
  });
  const textY = interpolate(textProgress, [0, 1], [20, 0]);
  const textOpacity = interpolate(textProgress, [0, 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Screenshot animation — slides in from right
  const imgProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 200 },
  });
  const imgX = interpolate(imgProgress, [0, 1], [60, 0]);
  const imgOpacity = interpolate(imgProgress, [0, 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Fade out
  const fadeOut = interpolate(
    frame,
    [duration - 30, duration - 10],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    },
  );

  // Pan-scroll: slowly move the zoomed image from top to ~40% down
  const panY = panScroll
    ? interpolate(frame, [30, duration - 40], [0, 40], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.quad),
      })
    : 0;

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        padding: "50px 60px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 50,
      }}
    >
      {/* Left panel: step info */}
      <div
        style={{
          flex: "0 0 520px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        {/* Step badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: badgeOpacity,
            transform: `scale(${badgeScale})`,
            transformOrigin: "left center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: `${color}20`,
              border: `2px solid ${color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
              fontFamily: FONT.sans,
              color,
            }}
          >
            {stepNum}
          </div>
          <div style={{ fontSize: 36 }}>{emoji}</div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            fontFamily: FONT.sans,
            color: COLORS.brightWhite,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 22,
            fontFamily: FONT.sans,
            color: COLORS.dimWhite,
            lineHeight: 1.6,
          }}
        >
          {desc}
        </div>

        {/* Actor badge */}
        <div
          style={{
            fontSize: 18,
            fontFamily: FONT.sans,
            color,
            backgroundColor: `${color}10`,
            border: `1px solid ${color}30`,
            borderRadius: 24,
            padding: "8px 20px",
            alignSelf: "flex-start",
          }}
        >
          {actor}
        </div>
      </div>

      {/* Right panel: screenshot */}
      <div
        style={{
          flex: 1,
          height: panScroll ? 850 : "auto",
          overflow: "hidden",
          borderRadius: 12,
          border: `1px solid ${COLORS.gray}`,
          boxShadow: `0 8px 40px rgba(0,0,0,0.5)`,
          opacity: imgOpacity,
          transform: `translateX(${imgX}px)`,
        }}
      >
        <Img
          src={staticFile(`screenshots/${screenshot}`)}
          style={
            panScroll
              ? {
                  width: "100%",
                  objectFit: "cover",
                  objectPosition: `${panAlign} ${panY}%`,
                  height: panHeight,
                  borderRadius: 0,
                }
              : {
                  maxWidth: "100%",
                  maxHeight: 820,
                  borderRadius: 0,
                  objectFit: "contain",
                }
          }
        />
      </div>
    </AbsoluteFill>
  );
};
