import { describe, it, expect } from "vitest";

import {
    Vector2 
} from "../../../src/core";


describe("classes.vector2.new", () => {
    it("creates a Vector2", () => {
        let v = new Vector2(5, 3);

        expect( v.x() ).toBe(5);
        expect( v.y() ).toBe(3);
    });

    it("defaults missing values to 0", () => {
        let v = new Vector2();

        expect( v.x() ).toBe(0);
        expect( v.y() ).toBe(0);
    });

    it("throws an error when X is not a number", () => {
        expect( () => new Vector2("4", 5) ).toThrow();
    });

    it("throws an error when Y is not a number", () => {
        expect( () => new Vector2(4, "5") ).toThrow();
    });
});

describe("classes.vector2.add", () => {
    it("calculates the sum of two Vector2 (tests commutativity)", () => {
        let a = new Vector2(3, 2);
        let b = new Vector2(-1, 3);

        let result1 = a.add(b);
        let result2 = b.add(a);

        expect( result1.x() ).toBeCloseTo( 2 );
        expect( result1.y() ).toBeCloseTo( 5 );

        expect( result2.x() ).toBeCloseTo( 2 );
        expect( result2.y() ).toBeCloseTo( 5 );

        expect( result1 ).toEqual( new Vector2(2, 5) );
        expect( result2 ).toEqual( new Vector2(2, 5) );
    });
});

describe("classes.vector2.sub", () => {
    it("calculates the difference of two Vector2s (tests anticommutativity)", () => {
        let a = new Vector2(5, -2);
        let b = new Vector2(-3, 1);

        let result1 = a.sub(b);
        let result2 = b.sub(a);

        expect( result1.x() ).toBeCloseTo( 8 );
        expect( result1.y() ).toBeCloseTo( -3 );

        expect( result2.x() ).toBeCloseTo( -8 );
        expect( result2.y() ).toBeCloseTo( 3 );
    });
});

describe("classes.vector2.scale", () => {
    it("scales a Vector2 up, then down to the original value", () => {
        let a = new Vector2(-7, 12.5);

        let result1 = a.scale(5);
        let result2 = result1.scale(0.2);

        expect( result1.x() ).toBeCloseTo( -35 );
        expect( result1.y() ).toBeCloseTo( 62.5 );

        expect( result2.x() ).toBeCloseTo( -7 );
        expect( result2.y() ).toBeCloseTo( 12.5 );
    });
});

describe("classes.vector2.mag", () => {
    it("calculates the magnitude of a positive Vector2 (X, Y)", () => {
        expect( new Vector2(5, 3).mag() ).toBeCloseTo( 5.83095189485, 5 );
    });

    it("calculates the magnitude of a negative Vector2 (-X, -Y)", () => {
        expect( new Vector2(-5, -3).mag() ).toBeCloseTo( 5.83095189485, 5 );
    });

    it("calculates the magnitude of a zero Vector2 (0, 0)", () => {
        expect( new Vector2().mag() ).toBe( 0 );
    })
});

describe("classes.vector2.unit", () => {
    it("calculates the unit of a trivial Vector2 (X, 0)", () => {
        let unit = new Vector2(6, 0).unit();

        expect( unit ).toEqual( new Vector2(1, 0) );
    });

    it("calculates the unit of a positive Vector2 (X, Y)", () => {
        let unit = new Vector2(3, 2).unit();

        expect( unit.x() ).toBeCloseTo( 0.83205029433 );
        expect( unit.y() ).toBeCloseTo( 0.55470019622 );
    })

    it("calculates the unit of a negative Vector2 (-X, -Y)", () => {
        let unit = new Vector2(-3, -2).unit();

        expect( unit.x() ).toBeCloseTo( -0.83205029433 );
        expect( unit.y() ).toBeCloseTo( -0.55470019622 );
    });
});

