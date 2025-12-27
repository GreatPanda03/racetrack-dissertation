// manages instances of Vector2 objects
// * vector2s are simple (x, y) vectors with simple maths operations

export default class Vector2 {
    #x;     // float
    #y;     // float
    
    constructor(x, y) {
        this.#x = x ?? 0;
        this.#y = y ?? 0;
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

    // serialisation
    toObject() {
        return {
            x: this.#x,
            y: this.#y
        }
    }

    static toVector(object) {
        return new Vector2(object.x, object.y);
    }

    toJson(pretty) {
        return JSON.stringify(this.toObject(), null, pretty);
    }
}