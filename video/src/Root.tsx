import "./index.css";
import { Composition } from "remotion";
import { MyComposition, TOTAL_DURATION } from "./Composition";
import { VIDEO } from "./styles/theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AgenticDevOps"
        component={MyComposition}
        durationInFrames={TOTAL_DURATION}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    </>
  );
};
