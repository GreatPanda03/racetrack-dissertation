// class to manage Lobby instances

import RACER_TYPE from "../../enums/racer-type.js";
import RACECAR_INFO from "../../enums/racecar-info.js";
import LOBBY_LOCALITY from "../../enums/lobby-locality.js";
import Validator from "../../utilities/validator.js";


export default class Lobby {
    #id;
    #hostId;
    #trackId;
    #racers;
    #options;
    #locality;

    constructor() {
        this.#id = null;
        this.#trackId = "";
        this.#racers = [];
        this.#options = {
            "Auto-retry Players": false,
            "Auto-retry Robots": false
        };
        this.#locality = 1;
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

    getRacers() { return this.#racers; }

    getOptions() { return this.#options; }
    
    getLocality() { return this.#locality};
    setLocality(locality) {
        Validator.valuePresence(LOBBY_LOCALITY, locality);
        this.#locality = locality;
    } 


    // methods
    addRacer(racerType, carType, colour) {
        Validator.valuePresence(RACER_TYPE, racerType);
        Validator.keyPresence(RACECAR_INFO, carType);
        Validator.isPrimitive(colour, "string");

        let racer = {
            RacerType: racerType,
            CarType: carType,
            Colour: colour};

        this.#racers.push(racer);

        return racer;
    }

    removeRacer(racer) {
        let index = Validator.listPresence(this.#racers, racer);
        this.#racers.splice(index, 1);
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
        return {
            id: this.#id,
            hostId: this.#hostId,
            trackId: this.#trackId,
            racers: this.#racers,
            options: this.#options,
            locality: this.#locality
        };
    }

    static toInstance(object) {
        let lobby = new Lobby();

        lobby.#id = object.id;
        lobby.#hostId = object.hostId;
        lobby.#trackId = object.trackId;
        lobby.#racers = object.racers || [];
        lobby.#options = object.options || {};
        lobby.#locality = object.locality;

        return lobby;
    }

    toJSON() {
        return this.toObject();
    }
}