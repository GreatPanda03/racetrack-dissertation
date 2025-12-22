// manages instances of Vector2 objects
// * vector2s are simple (x, y) vectors with simple maths operations

export default class Vector2 {
    #x;     // float
    #y;     // float
    
    constructor(x, y) {
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

    subtract(b) {
        let a = this;
        return new Vector2(
            a.x() - b.x(), a.y() - b.y());
    }

    scale(s) {
        let v = this;
        return new Vector2(v.x() * s, v.y() * s);
    }

    magnitude() {
        return ((this.#x ** 2) + (this.#y ** 2)) ** 0.5;
    }

    unit() {
        let v = this;
        let m = this.magnitude();
        return this.scale(1 / (m == 0 ? 1 : m));
    }
}