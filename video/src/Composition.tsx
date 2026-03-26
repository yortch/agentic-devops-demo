import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { MacBackground } from "./components/MacBackground";
import { TitleScene, TITLE_DUR } from "./components/TitleScene";
import { OverviewScene, OVERVIEW_DUR } from "./components/OverviewScene";
import { SreIntroScene, SRE_INTRO_DUR } from "./components/SreIntroScene";
import { LoopIntroScene, LOOP_INTRO_DUR } from "./components/LoopIntroScene";
import { StepScene, STEP_DUR } from "./components/StepScene";
import { CtaScene, CTA_DUR } from "./components/CtaScene";
import { TIMING, STEPS } from "./styles/theme";

const T = TIMING.TRANSITION_FRAMES;

// Scene durations: Title, Overview, SRE Intro, Loop Intro, 8 steps, CTA
const SCENE_DURATIONS = [
  TITLE_DUR,
  OVERVIEW_DUR,
  SRE_INTRO_DUR,
  LOOP_INTRO_DUR,
  ...STEPS.map(() => STEP_DUR),
  CTA_DUR,
];

const NUM_TRANSITIONS = SCENE_DURATIONS.length - 1;

export const TOTAL_DURATION =
  SCENE_DURATIONS.reduce((a, b) => a + b, 0) - NUM_TRANSITIONS * T;

export const MyComposition = () => {
  const fadeSpring = (
    <TransitionSeries.Transition
      presentation={fade()}
      timing={springTiming({ config: { damping: 200 }, durationInFrames: T })}
    />
  );

  const slideFromRight = (
    <TransitionSeries.Transition
      presentation={slide({ direction: "from-right" })}
      timing={springTiming({ config: { damping: 200 }, durationInFrames: T })}
    />
  );

  return (
    <AbsoluteFill>
      <MacBackground />

      <TransitionSeries>
        {/* Hero */}
        <TransitionSeries.Sequence durationInFrames={TITLE_DUR}>
          <TitleScene />
        </TransitionSeries.Sequence>

        {fadeSpring}

        {/* Built with Copilot — 3 tool cards */}
        <TransitionSeries.Sequence durationInFrames={OVERVIEW_DUR}>
          <OverviewScene />
        </TransitionSeries.Sequence>

        {fadeSpring}

        {/* Azure SRE Agent intro */}
        <TransitionSeries.Sequence durationInFrames={SRE_INTRO_DUR}>
          <SreIntroScene />
        </TransitionSeries.Sequence>

        {fadeSpring}

        {/* "From Defect to Fix" loop header */}
        <TransitionSeries.Sequence durationInFrames={LOOP_INTRO_DUR}>
          <LoopIntroScene />
        </TransitionSeries.Sequence>

        {slideFromRight}

        {/* 8-step agentic loop */}
        {STEPS.map((step, i) => (
          <>
            <TransitionSeries.Sequence
              key={`step-${step.num}`}
              durationInFrames={STEP_DUR}
            >
              <StepScene
                stepNum={step.num}
                emoji={step.emoji}
                title={step.title}
                desc={step.desc}
                actor={step.actor}
                color={step.color}
                screenshot={step.screenshots[0]}
                duration={STEP_DUR}
                panScroll={"panScroll" in step && !!step.panScroll}
                panHeight={"panHeight" in step ? (step as any).panHeight : "200%"}
                panAlign={"panAlign" in step ? (step as any).panAlign : "center"}
              />
            </TransitionSeries.Sequence>
            {i < STEPS.length - 1 ? slideFromRight : fadeSpring}
          </>
        ))}

        {/* CTA */}
        <TransitionSeries.Sequence durationInFrames={CTA_DUR}>
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
