// class to manage instances of TrackForm objects
// * TrackForm stores a construction of the track and its extents


// [[ Imports ]] //
import Vector2 from "../geometry/vector2.js";
import PathNode from "../geometry/path-node.js";
import TrackNode from "./components/track-node.js";
import Track from "./track.js";
import SplineUtil from "../../utilities/spline-util.js";



// [[ Main Class ]] //
export default class TrackForm {
    _track;         // Track
    _leftSide;      // TrackNode[]
    _rightSide;     // TrackNode[]

    constructor(track) {
        if ( !(track instanceof Track) ) {
            throw new Error(`[TrackForm] "${track}" is not a valid Track`);
        }

        this._track = track;
        this._leftSide = [];
        this._rightSide = [];

        this.updateNodeExtents();
    }

    // getters and setters
    getTrack() { return this._track; }
    getLeftSide() { return this._leftSide; }
    getRightSide() { return this._rightSide; }


    // methods

    // returns the extents of a node based on its width
    getSegmentExtents(node) {
        if ( !(node instanceof TrackNode) ) {
            throw new Error(`[TrackForm] "${node}" is not a TrackNode`);
        }

        let track = this._track;

        let path = track.getPath();
        let index = track.getNodeIndex(node);
        let midPos = node.getPosition();
        let width = node.getWidth();
        let looped = track.isLooped();

        let w2 = width / 2;

        let t = index;
        let gradient = SplineUtil.getGradientAtT(path, t, looped);
        let unit = gradient.unit();

        let leftPos = new Vector2(
            midPos.x() - w2 * -unit.y(),
            midPos.y() - w2 *  unit.x());

        let rightPos = new Vector2(
            midPos.x() + w2 * -unit.y(),
            midPos.y() + w2 *  unit.x());

        return [leftPos, rightPos];
    }

    // adds a left / right side around the given node
    // * as of v1.0.0 - not really used, redundant (keep for reference)
    addSegment(node) {
        if ( !(node instanceof TrackNode) ) {
            throw new Error(`[TrackForm] "${node}" is not a TrackNode`);
        }

        let track = this._track;
        let leftSide = this._leftSide;
        let rightSide = this._rightSide;

        let index = track.getNodeIndex(node);
        let [leftPos, rightPos] = this.getSegmentExtents(node);

        this._leftSide = leftSide.toSpliced(index, 0, new PathNode(leftPos));
        this._rightSide = rightSide.toSpliced(index, 0, new PathNode(rightPos));
    }

    // updates the extents of all nodes
    updateNodeExtents() {
        this._leftSide = [];
        this._rightSide = [];

        let track = this._track;
        let path = track.getPath();

        for (let node of path) {
            let [leftPos, rightPos] = this.getSegmentExtents(node);

            this._leftSide.push(new PathNode(leftPos));
            this._rightSide.push(new PathNode(rightPos));
        }
    }
}