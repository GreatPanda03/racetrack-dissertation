// static utility class for spline operations

import Vector2 from "../classes/geometry/vector2.js";
import PathNode from "../classes/geometry/path-node.js";


export default class SplineUtil {
    static getInfluencersAtT(nodes, t, looped) {
        let p0, p1, p2, p3;
        let size = nodes.length;

        if (size == 0) {
            throw new Error("[SplineUtils] An empty path was provided");
        }

        t %= size; // in case of overflow

        if (!looped) {
            let min = 0, max = size - 1; // path indexes

            p1 = Math.floor(t);
            p2 = Math.max(min, Math.min(p1 + 1, max));
            p3 = Math.max(min, Math.min(p2 + 1, max));
            p0 = Math.max(min, Math.min(p1 - 1, max));
            
        } else {
            p1 = Math.floor(t);
            p1 = (p1 == nodes.length) ? 0 : p1;
            p2 = (p1 + 1) % size;
            p3 = (p2 + 1) % size;
            p0 = p1 >= 1 ? p1 - 1 : size - 1;
        }

        // console.log(t, p0, p1, p2, p3);

        return [p0, p1, p2, p3];
    }

    static getPointAtT(nodes, t, looped) {
        let [p0, p1, p2, p3] = SplineUtil.getInfluencersAtT(nodes, t, looped);

        t %= 1;

        let tt = t * t;
        let ttt = tt * t;

        let q0 = -  ttt + 2*tt - t;
	    let q1 =  3*ttt - 5*tt + 2;
	    let q2 = -3*ttt + 4*tt + t;
	    let q3 =    ttt -   tt    ;

        let pos0, pos1, pos2, pos3;

        // * TODO: change this for this & gradient
        if (nodes[p0] instanceof PathNode) {
            pos0 = nodes[p0].getPosition();
            pos1 = nodes[p1].getPosition();
            pos2 = nodes[p2].getPosition();
            pos3 = nodes[p3].getPosition();
        } else {
            pos0 = nodes[p0];
            pos1 = nodes[p1];
            pos2 = nodes[p2];
            pos3 = nodes[p3];
        }

        // halve: because t ranges from 0 to 2 with these equations
        let tx = 0.5 * ( (pos0.x * q0) + (pos1.x * q1) + (pos2.x * q2) + (pos3.x * q3) );
        let ty = 0.5 * ( (pos0.y * q0) + (pos1.y * q1) + (pos2.y * q2) + (pos3.y * q3) );

        return new Vector2(tx, ty);
    }

    static getGradientAtT(nodes, t, looped) {
        let [p0, p1, p2, p3] = SplineUtil.getInfluencersAtT(nodes, t, looped);

        t %= 1;

        let tt = t * t;

        // differentiated formulae of "getPointAtT"
        let q0 = -3*tt +  4*t - 1;
        let q1 =  9*tt - 10*t    ;
        let q2 = -9*tt +  8*t + 1;
        let q3 =  3*tt -  2*t    ;

        let pos0, pos1, pos2, pos3;

        if (nodes[p0] instanceof PathNode) {
            pos0 = nodes[p0].getPosition();
            pos1 = nodes[p1].getPosition();
            pos2 = nodes[p2].getPosition();
            pos3 = nodes[p3].getPosition();
        } else {
            pos0 = nodes[p0];
            pos1 = nodes[p1];
            pos2 = nodes[p2];
            pos3 = nodes[p3];
        }

        // halve: because t ranges from 0 to 2 with the undifferentiated equations
        let tx = 0.5 * ( (pos0.x * q0) + (pos1.x * q1) + (pos2.x * q2) + (pos3.x * q3) );
        let ty = 0.5 * ( (pos0.y * q0) + (pos1.y * q1) + (pos2.y * q2) + (pos3.y * q3) );

        return new Vector2(tx, ty);
    }
}