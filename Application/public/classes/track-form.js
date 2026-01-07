// class to manage instances of TrackForm objects
// * TrackForm stores a construction of the track and its extents


// [[ Imports ]] // 
import Vector2 from "./vector2.js";
import TrackNode from "./track-node.js";
import Track from "./track.js";
import SplineUtil from "../utilities/spline-util.js";



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

        for (let node of track.getPath()) {
            this.addSegment(node);
        }
    }

    // getters and setters
    getTrack() { return this._track; }
    getLeftSide() { return this._leftSide; }
    getRightSide() { return this._rightSide; }


    // methods

    // returns the extents of a node based on its width
    getSegmentExtents(node) {
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
            midPos.x() + w2 * -unit.y(),
            midPos.y() + w2 *  unit.x());

        let rightPos = new Vector2(
            midPos.x() - w2 * -unit.y(),
            midPos.y() - w2 *  unit.x());

        return [leftPos, rightPos];
    }

    // adds a left / right side around the given node
    addSegment(node) {
        let track = this._track;
        let leftSide = this._leftSide;
        let rightSide = this._rightSide;

        let index = track.getNodeIndex(node);
        let [leftPos, rightPos] = this.getSegmentExtents(node);

        this._leftSide = leftSide.toSpliced(index, 0, new TrackNode(leftPos, 25, false));
        this._rightSide = rightSide.toSpliced(index, 0, new TrackNode(rightPos, 25, false));
    }

    // updates the extents of all nodes
    updateNodeExtents() {
        let track = this._track;
        let leftSide = this._leftSide;
        let rightSide = this._rightSide;
        let path = track.getPath();

        for (let n = 0; n < path.length; n++) {
            let node = path[n];
            let [leftPos, rightPos] = this.getSegmentExtents(node);

            leftSide[n].setPosition(leftPos);
            rightSide[n].setPosition(rightPos);
        }
    }
}