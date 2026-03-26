import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Deterministic pseudo-random for particles (seeded, no Math.random)
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

const PARTICLE_COUNT = 18;
const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: seededRandom(i * 3) * 100,
  y: seededRandom(i * 3 + 1) * 100,
  size: 1 + seededRandom(i * 3 + 2) * 2,
  speed: 0.08 + seededRandom(i * 7) * 0.15,
  opacity: 0.08 + seededRandom(i * 11) * 0.14,
}));

// Two soft ambient orbs — very muted
interface GlowOrb {
  cx: number;
  cy: number;
  radius: number;
  hue: number;
  phaseX: number;
  phaseY: number;
  drift: number;
}

const ORBS: GlowOrb[] = [
  { cx: 30, cy: 35, radius: 300, hue: 215, phaseX: 0, phaseY: 0.5, drift: 0.003 },
  { cx: 70, cy: 65, radius: 280, hue: 230, phaseX: 1.5, phaseY: 0, drift: 0.002 },
];

export const MacBackground: React.FC = () => {
  const frame = useCurrentFrame();

  // Very slow gradient rotation — barely perceptible
  const gradAngle = interpolate(frame, [0, 1800], [155, 175], {
    extrapolateRight: "extend",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Base gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${gradAngle}deg, #0d0d1a 0%, #101024 40%, #0e1726 70%, #0a0a18 100%)`,
        }}
      />

      {/* Ambient orbs — very soft, barely visible */}
      {ORBS.map((orb, i) => {
        const ox = orb.cx + Math.sin(frame * orb.drift + orb.phaseX) * 4;
        const oy = orb.cy + Math.cos(frame * orb.drift + orb.phaseY) * 3;
        return (
          <AbsoluteFill
            key={i}
            style={{
              background: `radial-gradient(circle ${orb.radius}px at ${ox}% ${oy}%, hsla(${orb.hue}, 50%, 22%, 0.1) 0%, transparent 70%)`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}

      {/* Subtle grid — structural, not decorative */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Sparse floating particles — very slow, very faint */}
      {particles.map((p, i) => {
        const elapsed = frame * p.speed;
        const px = p.x + Math.sin(elapsed * 0.01 + i) * 2;
        const py = (p.y - elapsed * 0.2 + 120) % 120 - 10;
        const twinkle = 0.6 + Math.sin(frame * 0.03 + i * 2.1) * 0.4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${px}%`,
              top: `${py}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: `rgba(160, 180, 210, ${p.opacity * twinkle})`,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
