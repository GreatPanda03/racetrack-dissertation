import { describe, it, expect } from "vitest";

import {
    Lobby, Player,
    PLAYER_TYPE, RACECAR_INFO
} from "../../../functions/src/core";


describe("classes.lobby.new", () => {
    it("creates an empty lobby", () => {
        let lobby = new Lobby();

        expect( lobby.getId() ).toBe( null );
        expect( lobby.getTrackId() ).toBe( "" );
        expect( lobby.getPlayers() ).toStrictEqual( {} );
        expect( lobby.getPlayerDetails()).toStrictEqual( {} );
        expect( lobby.getOptions() ).toStrictEqual( { "Auto-retry Players": false, "Auto-retry Robots": false });
        expect( lobby.getIsOnline() ).toBe( false );
    });
});

describe("classes.lobby.addPlayer", () => {
    it("adds the given player to the lobby with a new details entry", () => {
        let lobby = new Lobby();

        let playerId = "id_123";
        let player = new Player(playerId, "Player", PLAYER_TYPE.Player);
        let racer = lobby.addPlayer(player);

        expect( lobby.getPlayers()[playerId] ).toBe( player );

        expect( lobby.getPlayerDetail(playerId, "carType") ).toBe( "The Race Car" );
        expect( lobby.getPlayerDetail(playerId, "colour") ).toBe( "#ff4040" );
    });

    it("throws an error if not valid player is provided", () => {
        let lobby = new Lobby()

        expect( () => lobby.addPlayer() ).toThrowError();
        expect( () => lobby.addPlayer("a") ).toThrowError();
        expect( () => lobby.addPlayer(PLAYER_TYPE.Player) ).toThrowError();
    })
});

describe("classes.lobby.removePlayer", () => {
    it("removes the given player from the lobby", () => {
        let lobby = new Lobby();

        let playerId = "id_123";
        let player = new Player(playerId, "Player", PLAYER_TYPE.Player);
        let racer = lobby.addPlayer(player);

        lobby.removePlayer(player);

        expect( Object.keys(lobby.getPlayers()).length ).toBe( 0 );
    });

    it("throws an error if the racer isn't a lobby member", () => {
        let lobby = new Lobby();

        let playerId = "id_123";
        let player = new Player(playerId, "Player", PLAYER_TYPE.Player);
        let racer = lobby.addPlayer(player);

        lobby.removePlayer(player);

        expect( () => lobby.removeRacer(player) ).toThrowError();
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



