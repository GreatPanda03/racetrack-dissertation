// class to manage Lobby instances

import Player from "./player.js";
import PLAYER_TYPE from "../../enums/player-type.js";
import RACECAR_INFO from "../../enums/racecar-info.js";
import Validator from "../../utilities/validator.js";


export default class Lobby {
    #id;
    #hostId;
    #trackId;
    #players;
    #playerDetails;
    #options;

    constructor() {
        this.#id = null;
        this.#trackId = "";
        this.#players = {};
        this.#playerDetails = {};
        this.#options = {
            "Auto-retry Players": false,
            "Auto-retry Robots": false
        };
    }


    // getters / setters
    getId() { return this.#id; }
    setId(id) { 
        Validator.isPrimitive(id, "string");
        this.#id = id;
    }

    getHostId() { return this.#hostId }
    setHostId(id) {
        Validator.isPrimitive(id, "string");
        this.#hostId = id;
    }

    getTrackId() { return this.#trackId; }
    setTrackId(id) {
        Validator.isPrimitive(id, "string");
        this.#trackId = id;
    }

    getPlayers() { return this.#players; }

    getPlayerDetails() { return this.#playerDetails }
    setPlayerDetails(details) {
        this.#playerDetails = details
    }

    getOptions() { return this.#options; }


    // methods
    addPlayer(player) {
        Validator.isInstance(player, Player);
        Validator.keyAbsence(this.#players, player.getId());

        let id = player.getId();

        this.#players[id] = player;
        this.#playerDetails[id] = {
            carType: "The Race Car",
            colour: "#ff4040"};

        return player;
    }

    removePlayer(player) {
        let id = player.getId();
        let index = Validator.keyPresence(this.#players, id);
        delete this.#players[id];
        delete this.#playerDetails[id];
    }

    setPlayerDetail(playerId, detail, value) {
        Validator.keyPresence(this.#playerDetails, playerId);
        let entry = this.#playerDetails[playerId];
        entry[detail] = value;
    }

    getPlayerDetail(playerId, detail) {
        Validator.keyPresence(this.#playerDetails, playerId);
        let entry = this.#playerDetails[playerId];
        return entry[detail];
    }

    setOption(option, value) {
        Validator.keyPresence(this.#options, option);
        this.#options[option] = value;
    }

    getOption(option) {
        Validator.keyPresence(this.#options, option)
        return this.#options[option];
    }


    // serialisation
    toObject() {
        let players = {};
        for (let [id, player] of Object.entries(this.#players)) {
            players[id] = player.toObject();
        }

        return {
            id: this.#id,
            hostId: this.#hostId,
            trackId: this.#trackId,
            players,
            playerDetails: this.#playerDetails,
            options: this.#options
        };
    }

    static toInstance(object) {
        let lobby = new Lobby();

        lobby.#id = object.id;
        lobby.#hostId = object.hostId;
        lobby.#trackId = object.trackId;
        lobby.#playerDetails = object.playerDetails;
        lobby.#options = object.options || {};

        for (let [id, player] of Object.entries(object.players)) {
            lobby.#players[id] = Player.toInstance(player);
        }

        return lobby;
    }

    toJSON() {
        return this.toObject();
    }
}