// class to manage instances of TrackForm objects
// * TrackBoundaries calculates and checks track boundaries being crossed

// * source: "How to check if two given line segments intersect?", GeeksforGeeks, geeksforgeeks.org, [Online]. Accessed: Nov 29, 2025. Available at: https://www.geeksforgeeks.org/dsa/check-if-two-given-line-segments-intersect/
// * source: M. Shimrat, "Algorithm 112: Position of point relative to polygon", Commun. ACM, vol. 5, no. 8, p. 434, Aug. 1962.


// [[ Imports ]] //
import Track from "./track.js";
import TrackForm from "./track-form.js";
import SplineUtil from "../../utilities/spline-util.js";



// [[ Main Class ]] //
export default class TrackBoundaries extends TrackForm {
    _boundaries;    // Vector2[][]

    constructor(track) {
        if ( !(track instanceof Track) ) {
            throw new Error(`[TrackBoundaries] "${track}" is not a valid Track`);
        }

        super(track);

        this.calculateBoundaries();
    }

    // getters / setters
    getBoundaries() { return this._boundaries; }


    // methods

    // calculates the track's boundaries
    // * edges between conseuctive left / right node pairs
    calculateBoundaries() {
        this._boundaries = [];

        let track = this._track;
        let size = track.getSize();
        if (size == 0) return;
        
        let obstacles = track.getObstacles();
        let looped = track.isLooped();

        let left = this._leftSide;
        let right = this._rightSide;
        

        // track edges (same idea as drawing track path)
        let res = 0.1;
        let tmax = looped ? size : size - 1

        for (let t = 0; t < tmax; t += res) {
            let left1  = SplineUtil.getPointAtT(left , t      , looped);
            let left2  = SplineUtil.getPointAtT(left , t + res, looped);
            let right1 = SplineUtil.getPointAtT(right, t      , looped);
            let right2 = SplineUtil.getPointAtT(right, t + res, looped);

            this._boundaries.push([left1, left2]);
            this._boundaries.push([right1, right2]);
        }

        // start / finish line are boundaries for unlooped tracks
        if (!looped) {
            let start = [left[0].getPosition(), right[0].getPosition()];
            let end = [left[size - 1].getPosition(), right[size - 1].getPosition()];

            this._boundaries.unshift(start);
            this._boundaries.push(end);
        }

        // obstacles
        let obstacleEdges = obstacles.map((o) => o.getEdges()).flat();
        this._boundaries = this._boundaries.concat( obstacleEdges );
    }

    // [source 2] returns whether the two given lines intersect (Vector2 points)
    static doLinesIntersect(p11, p12, p21, p22) {
        function onSegment(p, q, r) {
            return ( q.x() <= Math.max( p.x(), r.x() ) && q.x() >= Math.min( p.x(), r.x() ) )
                && ( q.y() <= Math.max( p.y(), r.y() ) && q.y() >= Math.min( p.y(), r.y() ) );
        }

        function getOrientation(p, q, r) {
            let value = ( q.y() - p.y() ) * ( r.x() - q.x() ) - ( q.x() - p.x() ) * ( r.y() - q.y() );
            return value == 0 ? 0 : (value > 0 ? 1 : 2);
        }

        let o1 = getOrientation(p11, p12, p21);
        let o2 = getOrientation(p11, p12, p22);
        let o3 = getOrientation(p21, p22, p11);
        let o4 = getOrientation(p21, p22, p12);
        
        return ( o1 != o2 && o3 != o4 )
            || ( o1 == 0 && onSegment(p11, p21, p12) )
            || ( o2 == 0 && onSegment(p11, p22, p12) )
            || ( o3 == 0 && onSegment(p21, p11, p22) )
            || ( o4 == 0 && onSegment(p21, p12, p22) );   
    }
}