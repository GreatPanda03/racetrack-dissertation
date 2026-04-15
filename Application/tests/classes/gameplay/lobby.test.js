import { describe, it, expect } from "vitest";

import {
    Lobby,
    RACER_TYPE, RACECAR_INFO
} from "../../../src/core";


describe("classes.lobby.new", () => {
    it("creates an empty lobby", () => {
        let lobby = new Lobby();

        expect( lobby.getRacers().length ).toBe( 0 );
    });
});

describe("classes.lobby.addRacer", () => {
    it("adds the given racer details as an entry in the lobby", () => {
        let lobby = new Lobby();

        let racer = lobby.addRacer(RACER_TYPE.Player, "The Race Car", "#A00");

        expect( racer.RacerType ).toBe( RACER_TYPE.Player );
        expect( racer.CarType ).toBe( "The Race Car" );
        expect( racer.Colour ).toBe( "#A00" );

        expect( lobby.getRacers()[0] ).toBe( racer );
    });

    it("throws an error if any of the details provided are invalid", () => {
        let lobby = new Lobby()

        let racerType_bad = new Object()
        let carType_bad = new Object()
        let colour_bad = new Object()

        let racerType_good = RACER_TYPE.Player;
        let carType_good = "The Race Car";
        let colour_good = "#A00";

        expect( () => lobby.addRacer(racerType_bad, carType_good, colour_good) ).toThrowError();
        expect( () => lobby.addRacer(racerType_good, carType_bad, colour_good) ).toThrowError();
        expect( () => lobby.addRacer(racerType_good, carType_good, colour_bad) ).toThrowError();
    })
});

describe("classes.lobby.removeRacer", () => {
    it("removes the given racer object from the lobby", () => {
        let lobby = new Lobby();

        let racer = lobby.addRacer(RACER_TYPE.Player, "The Race Car", "#A00");

        lobby.removeRacer(racer);

        expect( lobby.getRacers().length ).toBe( 0 );
    });

    it("throws an error if the racer isn't a lobby member", () => {
        let lobby = new Lobby();

        let racer = lobby.addRacer(RACER_TYPE.Player, "The Race Car", "#A00");

        lobby.removeRacer(racer);

        expect( () => lobby.removeRacer(racer) ).toThrowError();
        expect( () => lobby.removeRacer(null) ).toThrowError();
        expect( () => lobby.removeRacer(new Object()) ).toThrowError();
    });
});

describe("classes.lobby.setOption", () => {
    it("sets an options value assuming it is an option", () => {
        let lobby = new Lobby();

        lobby.setOption("Auto-retry Players", true);
        lobby.setOption("Auto-retry Robots", true);

        expect( lobby.getOption("Auto-retry Players") ).toBe( true );
        expect( lobby.getOption("Auto-retry Robots") ).toBe( true );
    });

    it("throws an error when attempting to set a non-existing option", () => {
        let lobby = new Lobby();

        expect( () => lobby.setOption("BAD OPTION!!", true) ).toThrowError();
        expect( () => lobby.setOption("Auto-retry Robot", true) ).toThrowError();
            // "Robots", not "Robot"!
    });
});

describe("classes.lobby.getOption", () => {
    it("returns the value associated with the option", () => {
        let lobby = new Lobby();

        let value1 = lobby.getOption("Auto-retry Players");
        let value2 = lobby.getOption("Auto-retry Robots");

        expect( value1 ).toBe( false );
        expect( value2 ).toBe( false );
    });

    it("throws an error when attempting to get a non-existing option", () => {
        let lobby = new Lobby();

        expect( () => lobby.getOption("BAD OPTION!!") ).toThrowError();
        expect( () => lobby.getOption("Auto-retry Robot") ).toThrowError();
            // "Robots", not "Robot"!
    })
});

describe("classes.lobby (serialisation)", () => {
    it("can convert itself to an object and back to an instance", () => {
        let instance = new Lobby();

        expect(() => {
            Lobby.toInstance( instance.toObject() );
        }).not.toThrowError();
    });
});



