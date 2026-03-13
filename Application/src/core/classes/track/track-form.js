// class to manage instances of TrackForm objects
// * TrackForm stores a construction of the track and its extents

import Vector2 from "../geometry/vector2.js";
import Line from "../geometry/line.js";
import PathNode from "../geometry/path-node.js";
import Track from "./track.js";
import SplineUtil from "../../utilities/spline-util.js";
import Validator from "../../utilities/validator.js";


export default class TrackForm {
    #nodeSpans;     // Line[]
    #centre;        // Line[]
    #boundaries;    // Line[]

    constructor(track) {
        Validator.isInstance(track, Track);
        
        this.calculateNodeSpans(track);
        this.calculateCentre(track, 0.1);
        this.calculateBoundaries(track, 0.1);
    }


    // getters / setters
    getNodeSpans() { return this.#nodeSpans; }
    getCentre() { return this.#centre; }
    getBoundaries() { return this.#boundaries; }


    // methods
    getNodeSpan(index) {
        Validator.inListBounds(this.#nodeSpans, index);
        return this.#nodeSpans[index];
    }

    getSplitNodeSpans() {
        let spans = this.#nodeSpans;
        let left = spans.map(s => s.start);
        let right = spans.map(s => s.end);

        return [left, right];
    }

    calculateNodeSpans(track) {
        // the "wingspan" of each track node
        Validator.isInstance(track, Track);

        this.#nodeSpans = [];

        let path = track.getPath();
        let looped = track.isLooped();

        for (let n = 0; n < path.length; n++) {
            let node = path[n];
            let middle = node.getPosition();
            let width = node.getWidth();
            
            let w2 = width / 2;

            let gradient = SplineUtil.getGradientAtT(path, n, looped);
            let unit = gradient.unit();

            let left = new Vector2(
                middle.x - w2 * -unit.y,
                middle.y - w2 *  unit.x);

            let right = new Vector2(
                middle.x + w2 * -unit.y,
                middle.y + w2 *  unit.x);

            let span = new Line(left, right);
            this.#nodeSpans.push(span);
        }
    }

    calculateCentre(track, res = 0.1) {
        // central line as smaller line segments (kind of like track boundaries)
        // * res - ditto as below

        Validator.isInstance(track, Track);
        Validator.isNumeric(res);
        
        this.#centre = [];

        let path = track.getPath();
        let size = track.getSize();
        if (size == 0) return;

        let looped = track.isLooped();

        // track edges (same idea as drawing track path)
        let tmax = looped ? size : size - 1

        for (let t = 0; t < tmax; t += res) {
            let mid1 = SplineUtil.getPointAtT(path , t      , looped);
            let mid2 = SplineUtil.getPointAtT(path , t + res, looped);

            this.#centre.push( new Line(mid1, mid2) );
        }
    }

    calculateBoundaries(track, res = 0.1) {
        // the actual collidable boundaries of the track (should correspond to spline)
        // * "res" = resolution - determines how "fine" the boundaries are

        Validator.isInstance(track, Track);
        Validator.isNumeric(res);

        this.#boundaries = [];

        let size = track.getSize();
        if (size == 0) return;
        
        let obstacles = track.getObstacles();
        let looped = track.isLooped();

        let left = [], right = [];

        for (let n = 0; n < track.getPath().length; n++) {
            let extents = this.getNodeSpan(n);
            left.push( new PathNode(extents.start) );
            right.push( new PathNode(extents.end) );
        }

        // track edges (same idea as drawing track path)
        let tmax = looped ? size : size - 1

        for (let t = 0; t < tmax; t += res) {
            let left1  = SplineUtil.getPointAtT(left , t      , looped);
            let left2  = SplineUtil.getPointAtT(left , t + res, looped);
            let right1 = SplineUtil.getPointAtT(right, t      , looped);
            let right2 = SplineUtil.getPointAtT(right, t + res, looped);

            this.#boundaries.push( new Line(left1, left2) );
            this.#boundaries.push( new Line(right1, right2) );
        }

        // start / finish line are boundaries for unlooped tracks
        if (!looped) {
            let start = new Line(left[0].getPosition(), right[0].getPosition());
            let end = new Line(left[size - 1].getPosition(), right[size - 1].getPosition());

            this.#boundaries.unshift(start);
            this.#boundaries.push(end);
        }

        // obstacles
        let obstacleEdges = obstacles.map(o => o.getEdges()).flat();
        let edgeLines = obstacleEdges.map(e => new Line(e[0], e[1]));
        this.#boundaries = this.#boundaries.concat(edgeLines);
    }
}