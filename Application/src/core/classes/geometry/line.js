// manages instances of Line objects
// * a Line is a straight line consisting of a start point and end point

// * source: F. Antonio, "IV.6 - FASTER LINE SEGMENT INTERSECTION", in Graphics Gems III (IBM Version), D. Kirk, Ed. San Francisco: Morgan Kaufmann, 1992, pp. 199–202.
// * source: "How can you determine a point is between two other points on a line segment?", StackOverflow, stackoverflow.com, [Online]. Available at: https://stackoverflow.com/questions/328107/. Accessed: Feb. 8, 2026.

import Vector2 from "./vector2.js";
import Validator from "../../utilities/validator.js";


export default class Line {
    #start;     // Vector2
    #end;       // Vector2
    
    constructor(start, end) {
        Validator.isInstance(start, Vector2);
        Validator.isInstance(end, Vector2);

        this.#start = start;
        this.#end = end;
    }


    // getters / setters
    get start() { return this.#start; }
    get end() { return this.#end; }


    // methods
    
    // [source 1]
    getIntersection(other) {
        Validator.isInstance(other, Line);

        let p11 = this.#start, p12 = this.#end;
        let p21 = other.start, p22 = other.end;

        let A = p12.sub(p11);
        let B = p21.sub(p22);

        let denominator = (A.y * B.x) - (A.x * B.y);

        if (denominator == 0) { // ie. parallel / collinear
            if ( !(this.containsPoint(p21) || this.containsPoint(p22)) ) {
                return null; // only collinear
            }

            let length = p12.sub(p11).mag();
            let dist1 = p21.sub(p11).mag();
            let dist2 = p22.sub(p11).mag();

            if (length < dist1 && length < dist2) {
                return null;

            } else {
                return (dist1 < dist2) ? p21 : p22; // the "first point of contact"
            }
        }

        let C = p11.sub(p21);

        let alpha = (B.y * C.x - B.x * C.y) / denominator;
        let beta = (A.x * C.y - A.y * C.x) / denominator;

        if ( (0 <= alpha && alpha <= 1) && (0 <= beta && beta <= 1) ) {
            let direction = p12.sub(p11);
            let position = p11.add(direction.scale(alpha));
            return position;
        }

        return null;
    }

    static getIntersection(A, B) {
        Validator.isInstance(A, Line);
        Validator.isInstance(B, Line);

        return A.getIntersection(B);
    }

    // [source 2]
    containsPoint(q) {
        Validator.isInstance(q, Vector2);

        let p1 = this.start;
        let p2 = this.end;

        let cross = (q.y - p1.y) * (p2.x - p1.x) - (q.x - p1.x) * (p2.y - p1.y);

        return Math.abs(cross) == 0
            && Math.min(p1.x, p2.x) <= q.x && q.x <= Math.max(p1.x, p2.x)
            && Math.min(p1.y, p2.y) <= q.y && q.y <= Math.max(p1.y, p2.y)
    }
}