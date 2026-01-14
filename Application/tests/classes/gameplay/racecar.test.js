import { describe, it, expect } from "vitest";

import {
    Vector2,
    RaceCar
} from "../../../src/core";


describe("classes.racecar.new", () => {
    it("creates a new race car with default values", () => {
        let racecar = new RaceCar();

        expect( racecar.getPosition() instanceof Vector2 ).toBe(true);
        expect( racecar.getVelocity() instanceof Vector2 ).toBe(true);
    });
});

describe("classes.racecar.accelerate", () => {
    it("accelerates the car by the given velocity", () => {
        let racecar = new RaceCar();

        racecar.accelerate(new Vector2(5, 3));

        expect( racecar.getVelocity().x() ).toBe(5);
        expect( racecar.getVelocity().y() ).toBe(3);
    });

    it("throws an error if speedup is not a valid Vector2", () => {
        let racecar = new RaceCar();

        expect( () => racecar.accelerate() ).toThrowError();
        expect( () => racecar.accelerate("a") ).toThrowError();
        expect( () => racecar.accelerate(new Object()) ).toThrowError();
    });
});

describe("classes.racecar.move", () => {
    it("applies the car's current velocity", () => {
        let racecar = new RaceCar();

        racecar.setPosition(new Vector2(-3, 4));
        racecar.setVelocity(new Vector2(1, 2));

        racecar.move();

        expect( racecar.getPosition().x() ).toBe(-2);
        expect( racecar.getPosition().y() ).toBe(6);
    });
});