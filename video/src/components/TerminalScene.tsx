import { SceneHeader } from "./SceneHeader";
import { Terminal } from "./Terminal";
import type { Scene } from "../data/scenes";

interface TerminalSceneProps {
  scene: Scene;
}

/**
 * Composes a SceneHeader (UVP hook + subtitle) above a Terminal.
 * Header stays visible throughout and fades out before the crossfade.
 * Terminal is vertically centered in the remaining space below the header.
 */
export const TerminalScene: React.FC<TerminalSceneProps> = ({ scene }) => {
  return (
    <>
      {scene.header && (
        <SceneHeader
          header={scene.header}
          sceneDuration={scene.durationFrames}
        />
      )}
      <Terminal scene={scene} hasHeader={!!scene.header} />
    </>
  );
};
