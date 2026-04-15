// class to manage Lobby instances

import RACER_TYPE from "../../enums/racer-type.js";
import RACECAR_INFO from "../../enums/racecar-info.js";
import Validator from "../../utilities/validator.js";


export default class Lobby {
    #racers;
    #options;

    constructor() {
        this.#racers = [];
        this.#options = {
            "Auto-retry Players": false,
            "Auto-retry Robots": false
        };
    }


    // getters / setters
    getRacers() { return this.#racers; }
    getOptions() { return this.#options; }
    

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
            racers: this.#racers,
            options: this.#options
        };
    }

    static toInstance(object) {
        let lobby = new Lobby();

        lobby.#racers = object.racers;
        lobby.#options = object.options;

        return lobby;
    }

    toJSON() {
        return this.toObject();
    }
}