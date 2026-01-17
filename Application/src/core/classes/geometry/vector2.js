// manages instances of Vector2 objects
// * vector2s are simple (x, y) vectors with simple maths operations


// [[ Main Class ]] //
export default class Vector2 {
    #x;     // float
    #y;     // float
    
    constructor(x = 0, y = 0) {
        if (typeof x !== "number" || Number.isNaN(x)) { 
            throw new Error(`[Vector2] "${x}" is not a number`);
        }
        
        if (typeof y !== "number" || Number.isNaN(y)) {
            throw new Error(`[Vector2] "${y}" is not a number`);
        }

        this.#x = x;
        this.#y = y;
    }

    // getters / setters
    x() { return this.#x; }
    y() { return this.#y; }

    // methods
    add(b) {
        let a = this;
        return new Vector2(
            a.x() + b.x(), a.y() + b.y());
    }

    sub(b) {
        let a = this;
        return new Vector2(
            a.x() - b.x(), a.y() - b.y());
    }

    scale(s) {
        let v = this;
        return new Vector2(v.x() * s, v.y() * s);
    }

    mag() {
        return ((this.#x ** 2) + (this.#y ** 2)) ** 0.5;
    }

    unit() {
        let v = this;
        let m = this.mag();
        return this.scale(1 / (m == 0 ? 1 : m));
    }

    round() {
        return new Vector2(
            Math.round(this.x()), Math.round(this.y()));
    }

    // serialisation
    toObject() {
        return {
            x: this.#x,
            y: this.#y
        }
    }

    static toInstance(object) {
        return new Vector2(object.x, object.y);
    }

    toJson(pretty) {
        return JSON.stringify(this.toObject(), null, pretty);
    }
}