import { describe, it, expect } from "vitest";

import {
    Vector2 
} from "../../../src/core";


describe("classes.vector2.new", () => {
    it("creates a Vector2", () => {
        let v = new Vector2(5, 3);

        expect( v.x ).toBe(5);
        expect( v.y ).toBe(3);
    });

    it("defaults missing values to 0", () => {
        let v = new Vector2();

        expect( v.x ).toBe(0);
        expect( v.y ).toBe(0);
    });

    it("throws an error when X is not a number", () => {
        expect( () => new Vector2("4", 5) ).toThrowError();
    });

    it("throws an error when Y is not a number", () => {
        expect( () => new Vector2(4, "5") ).toThrowError();
    });
});

describe("classes.vector2.add", () => {
    it("calculates the sum of two Vector2 values", () => {
        let a = new Vector2(3, 2);
        let b = new Vector2(-1, 3);

        let result1 = a.add(b);
        let result2 = b.add(a);

        expect( result1.x ).toBeCloseTo( 2 );
        expect( result1.y ).toBeCloseTo( 5 );

        expect( result2.x ).toBeCloseTo( 2 );
        expect( result2.y ).toBeCloseTo( 5 );

        expect( result1 ).toEqual( new Vector2(2, 5) );
        expect( result2 ).toEqual( new Vector2(2, 5) );
    });

    it("throws an error if the addend is not a Vector2", () => {
        let a = new Vector2(5, -2);

        expect( () => a.add() ).toThrowError();
        expect( () => a.add("new Vector2(-3, 1)") ).toThrowError();
        expect( () => a.add(new Object()) ).toThrowError();
    });
});

describe("classes.vector2.sub", () => {
    it("calculates the difference of two Vector2 values", () => {
        let a = new Vector2(5, -2);
        let b = new Vector2(-3, 1);

        let result1 = a.sub(b);
        let result2 = b.sub(a);

        expect( result1.x ).toBeCloseTo( 8 );
        expect( result1.y ).toBeCloseTo( -3 );

        expect( result2.x ).toBeCloseTo( -8 );
        expect( result2.y ).toBeCloseTo( 3 );
    });

    it("throws an error if the subtrahend is not a Vector2", () => {
        let a = new Vector2(5, -2);

        expect( () => a.sub() ).toThrowError();
        expect( () => a.sub("new Vector2(-3, 1)") ).toThrowError();
        expect( () => a.sub(new Object()) ).toThrowError();
    });
});

describe("classes.vector2.scale", () => {
    it("scales a Vector2 up, then down to the original value", () => {
        let a = new Vector2(-7, 12.5);

        let result1 = a.scale(5);
        let result2 = result1.scale(1 / 5);

        expect( result1.x ).toBeCloseTo( -35 );
        expect( result1.y ).toBeCloseTo( 62.5 );

        expect( result2.x ).toBeCloseTo( -7 );
        expect( result2.y ).toBeCloseTo( 12.5 );
    });

    it("throws an error if the number to scale by is not a number", () => {
        let v = new Vector2(5, -2);

        expect( () => v.scale() ).toThrowError();
        expect( () => v.scale("5") ).toThrowError();
        expect( () => v.scale(new Vector2()) ).toThrowError();
    });
});

describe("classes.vector2.mag", () => {
    it("calculates the magnitude of a positive Vector2 (X, Y)", () => {
        expect( new Vector2(5, 3).mag() ).toBeCloseTo( 5.83095189485 );
    });

    it("calculates the magnitude of a negative Vector2 (-X, -Y)", () => {
        expect( new Vector2(-5, -3).mag() ).toBeCloseTo( 5.83095189485 );
    });

    it("calculates the magnitude of a zero Vector2 (0, 0)", () => {
        expect( new Vector2().mag() ).toBe( 0 );
    });
});

describe("classes.vector2.unit", () => {
    it("calculates the unit of a trivial Vector2 (X, 0)", () => {
        let unit = new Vector2(6, 0).unit();

        expect( unit ).toEqual( new Vector2(1, 0) );
    });

    it("calculates the unit of a positive Vector2 (X, Y)", () => {
        let unit = new Vector2(3, 2).unit();

        expect( unit.x ).toBeCloseTo( 0.83205029433 );
        expect( unit.y ).toBeCloseTo( 0.55470019622 );
    });

    it("calculates the unit of a negative Vector2 (-X, -Y)", () => {
        let unit = new Vector2(-3, -2).unit();

        expect( unit.x ).toBeCloseTo( -0.83205029433 );
        expect( unit.y ).toBeCloseTo( -0.55470019622 );
    });

    it("returns 0 if the Vector2 is (0, 0)", () => {
        let unit = new Vector2(0, 0).unit();

        expect( unit.x ).toBe( 0 );
        expect( unit.y ).toBe( 0 );
    });
});

describe("classes.vector2.round", () => {
    it("rounds the given Vector2 to the nearest integer values", () => {
        let a = new Vector2(-3.4, 7.8).round();
        
        expect( a.x ).toBe( -3 );
        expect( a.y ).toBe( 8 );
    });

    it("returns the same valued Vector2 when it's already rounded", () => {
        let a = new Vector2(5, 2).round();

        expect( a.x ).toBe( 5 );
        expect( a.y ).toBe( 2 );
    });
});

describe("classes.vector2.clamp", () => {
    it("clamps the given Vector2 by the given constraints", () => {
        let vector = new Vector2(5, 3);

        let clamped = vector.clamp(-3, 4, 0, 1);

        expect( clamped.x ).toBe( 4 );
        expect( clamped.y ).toBe( 1 );
    });

    it("returns the an equal-valued Vector2 when within the clamp ranges", () => {
        let vector = new Vector2(5, 3);

        let clamped = vector.clamp(-3, 5, 2, 5);

        expect( clamped.x ).toBe( 5 );
        expect( clamped.y ).toBe( 3 );
    });
});

describe("classes.vector2 (serialisation)", () => {
    it("can convert itself to an object and back to an instance", () => {
        let instance = new Vector2(-3, 5);

        expect(() => {
            Vector2.toInstance( instance.toObject() );
        }).not.toThrowError();
    });
});

