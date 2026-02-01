// mainly to be used by test cases for shorter imports...

// classes
export { default as Vector2 } from "./classes/geometry/vector2.js";
export { default as Polygon } from "./classes/geometry/polygon.js";
export { default as PathNode } from "./classes/geometry/path-node.js";

export { default as TrackNode } from "./classes/track/components/track-node.js";
export { default as Material } from "./classes/track/components/material.js";
export { default as Obstacle } from "./classes/track/components/obstacle.js";
export { default as Decoration } from "./classes/track/components/decoration.js";

export { default as TrackBoundaries } from "./classes/track/track-boundaries.js";
export { default as TrackForm } from "./classes/track/track-form.js";
export { default as Track } from "./classes/track/track.js";

export { default as CanvasRenderer } from "./classes/rendering/canvas-renderer.js";
export { default as TrackRenderer } from "./classes/rendering/track-renderer.js";
export { default as UndoRedoStack } from "./classes/rendering/undo-redo-stack.js";

export { default as RaceCar } from "./classes/gameplay/racecar.js";
export { default as RaceStats } from "./classes/gameplay/race-stats.js";
export { default as RaceInstance } from "./classes/gameplay/race-instance.js";

// enums
export { default as ACTION_TYPE } from "./enums/action-type.js";
export { default as MATERIAL_INFO } from "./enums/material-info.js";
export { default as RACECAR_INFO } from "./enums/racecar-info.js";
export { default as RACECAR_STATE } from "./enums/racecar-state.js";
export { default as TOOL_TYPE } from "./enums/tool-type.js";

// utilities
export { default as SplineUtil } from "./utilities/spline-util.js";