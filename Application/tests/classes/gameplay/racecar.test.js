import { describe, it, expect } from "vitest";

import {
    Vector2,
    RaceCar
} from "../../../src/core";


describe("classes.racecar.new", () => {
    it("creates a new race car with default values", () => {
        let racecar = new RaceCar();

        expect( racecar.getPosition() instanceof Vector2 ).toBe( true );
        expect( racecar.getVelocity() instanceof Vector2 ).toBe( true );
        expect( racecar.getMaxSpeed() instanceof Vector2 ).toBe( true );
        expect( racecar.getMaxAcceleration() instanceof Vector2 ).toBe( true );
    });
});

describe("classes.racecar.accelerate", () => {
    it("accelerates the race car by the given acceleration", () => {
        let racecar = new RaceCar();

        racecar.setCarType("The Race Car");

        racecar.setVelocity(new Vector2(5, -3));
        racecar.accelerate(new Vector2(1, -1));

        expect( racecar.getVelocity().x ).toBe( 6 );
        expect( racecar.getVelocity().y ).toBe( -4 );
    });

    it("limits the speedup when above the race car's max acceleration", () => {
        let racecar = new RaceCar();

        racecar.setCarType("The Race Car");

        racecar.setVelocity(new Vector2(5, -3));
        racecar.accelerate(new Vector2(3, -3));

        expect( racecar.getVelocity().x ).toBe( 6 );
        expect( racecar.getVelocity().y ).toBe( -4 );
    });

    it("limits the final velocity when above the race car's max velocity", () => {
        let racecar = new RaceCar();

        racecar.setCarType("The Race Car");

        racecar.setVelocity(new Vector2(-10, 10));
        racecar.accelerate(new Vector2(-1, 1));

        expect( racecar.getVelocity().x ).toBe( -10 );
        expect( racecar.getVelocity().y ).toBe( 10 );
    });

    it("throws an error if speedup is not a valid Vector2", () => {
        let racecar = new RaceCar();

        expect( () => racecar.accelerate() ).toThrowError();
        expect( () => racecar.accelerate("a") ).toThrowError();
        expect( () => racecar.accelerate(new Object()) ).toThrowError();
    });
});

describe("classes.racecar.move", () => {
    it("applies the race car's current velocity", () => {
        let racecar = new RaceCar();

        racecar.setPosition(new Vector2(-3, 4));
        racecar.setVelocity(new Vector2(1, 2));

        racecar.move();

        expect( racecar.getPosition().x ).toBe(-2);
        expect( racecar.getPosition().y ).toBe(6);
    });
});

describe("classes.racecar.setType", () => {
    it("sets the race car's stats according to the given type", () => {
        let racecar = new RaceCar();

        racecar.setCarType("The Motorbike");

        expect( racecar.getMaxSpeed().x ).toBe( 15 );
        expect( racecar.getMaxSpeed().y ).toBe( 15 );

        expect( racecar.getMaxAcceleration().x ).toBe( 2 );
        expect( racecar.getMaxAcceleration().y ).toBe( 2 );
    });

    it("throws an error if the given race car type isn't recognised", () => {
        let racecar = new RaceCar();

        expect( () => racecar.setCarType("NOT A REAL CAR!!!") ).toThrowError();
    });
});