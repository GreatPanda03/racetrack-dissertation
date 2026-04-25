// manages instances of Vector2 objects
// * a Vector2 is a simple (x, y) vector with basic vector operations

import Validator from "../../utilities/validator.js";


export default class Vector2 {
    #x;     // float
    #y;     // float
    
    constructor(x = 0, y = 0) {
        Validator.isNumeric(x);
        Validator.isNumeric(y);

        this.#x = x;
        this.#y = y;
    }


    // getters / setters
    get x() { return this.#x; }
    get y() { return this.#y; }


    // methods
    add(b) {
        Validator.isInstance(b, Vector2)
        let a = this;
        return new Vector2(a.x + b.x, a.y + b.y);
    }

    sub(b) {
        Validator.isInstance(b, Vector2)
        let a = this;
        return new Vector2(a.x - b.x, a.y - b.y);
    }

    scale(s) {
        Validator.isNumeric(s);
        let v = this;
        return new Vector2(v.x * s, v.y * s);
    }

    mag() {
        return ((this.#x ** 2) + (this.#y ** 2)) ** 0.5;
    }

    unit() {
        let m = this.mag();
        return this.scale(1 / (m == 0 ? 1 : m));
    }

    round() {
        return new Vector2(
            Math.round(this.x), Math.round(this.y));
    }

    clamp(xMin, xMax, yMin, yMax) {
        return new Vector2(
            Math.min(Math.max(this.#x, xMin), xMax),
            Math.min(Math.max(this.#y, yMin), yMax));
    }


    // serialisation
    toObject() {
        return { x: this.#x, y: this.#y };
    }

    static toInstance(object) {
        return new Vector2(object.x, object.y);
    }

    toJSON() {
        return this.toObject();
    }
}