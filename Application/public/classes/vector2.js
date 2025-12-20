class Vector2 {
    #x; #y;
    
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

    magnitude() {
        return ((this.#x ** 2) + (this.#y ** 2)) ** 0.5;
    }
}