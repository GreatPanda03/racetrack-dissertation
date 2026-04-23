// class to manage instance of RaceInstance objects
// * RaceInstance represents an active race session with details about 
//     racecars and the game state

// * source: M. Shimrat, "Algorithm 112: Position of point relative to polygon", Commun. ACM, vol. 5, no. 8, p. 434, Aug. 1962.

import Vector2 from "../geometry/vector2.js";
import Line from "../geometry/line.js";
import Track from "../track/track.js";
import TrackForm from "../track/track-form.js";
import Player from "./player.js";
import RaceCar from "./racecar.js";
import RaceStats from "./race-stats.js";
import Lobby from "./lobby.js";
import Validator from "../../utilities/validator.js";
import PLAYER_TYPE from "../../enums/player-type.js";
import RACECAR_STATE from "../../enums/racecar-state.js";
import MATERIAL_INFO from "../../enums/material-info.js";


export default class RaceInstance {
    #lobby;         // Lobby
    #track;         // Track
    #form;          // TrackForm
    #racecars;      // RaceCar[]
    #raceStats;     // RaceStats[]
    #spacing;       // float
    #turn;          // int
    #elapsedTime;   // float
    #pendingMoves;  // Vector2[][]

    constructor(lobby, track, spacing = 10, players = []) {
        if (!lobby && !track) {
            return; // assume empty
        }

        Validator.isInstance(lobby, Lobby);
        Validator.isInstance(track, Track);
        Validator.isNumeric(spacing);
        Validator.isInstanceList(players, Player);

        // main set up
        this.#lobby = lobby;
        this.#track = track;
        this.#form = new TrackForm(track);
        this.#racecars = [];
        this.#raceStats = [];
        this.#spacing = spacing;
        this.#turn = 0;
        this.#elapsedTime = 0;
        this.#pendingMoves = [];

        // player additions
        for (let player of players) {
            let id = player.getId();
            let playerType = player.getPlayerType();
            let colour = lobby.getPlayerDetail(id, "colour");
            let carType = lobby.getPlayerDetail(id, "carType");

            let racecar = new RaceCar();
            racecar.setPlayerId(id);
            racecar.setPlayerType(playerType);
            racecar.setColour(colour);
            racecar.setCarType(carType);
            
            this.addRacecar(racecar);
            this.moveRacecarToStart(racecar);
        };
    }

    // getters / setters
    getLobby() { return this.#lobby; }
    getTrack() { return this.#track; }
    getForm() { return this.#form; }
    getRacecars() { return this.#racecars; }
    getRaceStats() { return this.#raceStats; }
    getSpacing() { return this.#spacing; }
    getTurn() { return this.#turn; }
    getElapsedTime() { return this.#elapsedTime; }
    getPendingMoves() { return this.#pendingMoves; }

    setSpacing(spacing) {
        Validator.isNumeric(spacing);
        this.#spacing = spacing;
    }


    
    // [[ Preparation ]] //
    addRacecar(racecar) {
        let track = this.#track;
        let racecars = this.#racecars;
        let raceStats = this.#raceStats;

        Validator.isInstance(racecar, RaceCar);
        Validator.listAbsence(racecars, racecar);

        racecars.push(racecar);
        raceStats.push(new RaceStats(track, racecar.getPlayerId()));
    }

    moveRacecarToStart(racecar) {
        let track = this.#track;
        let looped = track.isLooped();
        let spacing = this.#spacing;

        let startPos = track.getPath()[0].getPosition();

        if (!looped) { // starts before directional dot
            let end = track.getPath()[1].getPosition();
            let unit = end.sub(startPos).unit();
            startPos = startPos.add(unit.scale(spacing));
        }

        racecar.setPosition(startPos.scale(1 / spacing).round());
    }



    // [[ Querying ]] //
    getRacecarStats(racecar) {
        let raceStats = this.#raceStats;
        let stats = raceStats.find(s => s.getPlayerId() == racecar.getPlayerId());
    
        if (!stats) throw new Error("[RaceInstance] No stats associated with the given racecar");

        return stats;
    }

    isAnyRacecarInState(state) {
        Validator.valuePresence(RACECAR_STATE, state);

        return this.#raceStats.some(rs => rs.getState() == state);
    }



    // [[ Turn Handling ]] //
    findNextTurn() {
        this.#turn += 1;

        console.log("Turn:", this.#turn);

        if (this.#turn >= this.#racecars.length) {
            console.log("Applying all moves");
            this.applyPendingMoves();
        }
    }

    getCurrentPlayer() {
        return this.#racecars[this.#turn];
    }


    
    // [[ Move Handling ]] //
    getPossibleMoves(racecar) { // [source 1] - containment

        /*
            * TODO: MAYBE rework this so that ALL INDIVIDUAL MOVE LINES are considered
            * for example - if a car's line to the CENTRAL dot crosses the material,
                then it's acceleration relative to THAT move is affected
            * ... but if the player picks a point which doesn't cross the material,
                then the car's speed shouldn't be affected at all (and they should still be able to go there)
            * basically - the edge points shouldn't be determined by the central
                point if they can be travelled to without crossing the material

            * ALSO: not sure if race car should be affected at all
                if it entirely crosses the material...
            * Vector Racer ONLY affects the car if it's IN the material
        */

        // determining the current material (if any)
        let spacing = this.#spacing;
        let pos = racecar.getPosition().scale(spacing);
        let ray = new Line(pos, new Vector2(10000, 0));

        let track = this.#track; 
        let materials = track.getMaterials();
        let onMaterial = null;

        for (let material of materials) {
            let crosses = 0;
            let edges = material.getEdges();
            
            for (let edge of edges) {
                let line = new Line(edge[0], edge[1]);
                let crossed = ray.getIntersection(line);
                if (crossed) crosses += 1;
            }

            if (crosses % 2 == 1) {
                onMaterial = material;
                break;
            }
        }

        // gathering possible moves based on material
        let moves = [];
        let acc = racecar.getMaxAcceleration().x;
        let effect;

        if (onMaterial) {
            let type = onMaterial.getType();

            if ( !(type in MATERIAL_INFO) ) {
                throw new Error(`[RaceInstance] "${type}" is not a recognised material`);
            }

            effect = MATERIAL_INFO[type].Effect;

        } else {
            effect = (racecar, x, y) => {
                return {
                    Offset: new Vector2(x, y),
                    Active: true
                }
            }
        }

        for (let x = -acc; x <= acc; x++) {
            for (let y = -acc; y <= acc; y++) {
                let move = effect(racecar, x, y);
                moves.push(move);
            }
        }

        // further limiting moves based on max speed
        let velocity = racecar.getVelocity();
        let maxSpeed = racecar.getMaxSpeed();

        for (let move of moves) {
            let finalVelocity = velocity.add(move.Offset);

            if (
                   Math.abs(finalVelocity.x) > maxSpeed.x
                || Math.abs(finalVelocity.y) > maxSpeed.y
            ) {
                move.Active = false;
            }
        }

        return moves;
    }

    isMoveLegal(racecar, move) {
        // TODO...
    }

    addPendingMove(racecar, move) {
        let index = this.getRacecars().findIndex(r => r == racecar);
        this.#pendingMoves[index] = move;
    }
    
    predictMove(racecar, acceleration) { // [source 1] - collisions
        Validator.isInstance(racecar, RaceCar);
        Validator.isInstance(acceleration, Vector2);

        let track = this.#track;
        let form = this.#form;
        let spacing = this.#spacing;
        let stats = this.getRacecarStats(racecar);

        let oldPos = racecar.getPosition();
        let newVel = racecar.getClampedSpeedup(acceleration);
        let newPos = racecar.getPosition().add(newVel);
        
        let route = new Line( oldPos.scale(spacing), newPos.scale(spacing) );

        // passing main checkpoints (must pass previous ones first)

        // * TODO: handle logic for 0 checkpoints - can just recross start...
        //     force at least ONE checkpoint half way around the track?

        let state = stats.getState();
        let checkpoints = stats.getCheckpoints();
        let checkpointIndexes = []; // indexes of crossed checkpoints
        let allPassed = true;

        // gathering indexes of all passed checkpoints
        for (let c = 0; c < checkpoints.length; c++) {
            let checkpoint = checkpoints[c];
            if (checkpoint.passed) continue;

            allPassed = false;

            let checkpointLine = form.getNodeSpan(checkpoint.index);
            let crossed = route.getIntersection(checkpointLine);

            if (crossed) checkpointIndexes.push(c);
        }

        // passing the finish line with all checkpoints crossed (win condition)
        if (allPassed) {
            let index = track.isLooped() ? 0 : track.getSize() - 1;
            let finishLine = form.getNodeSpan(index);

            let crossed = route.getIntersection(finishLine);

            if (crossed) {
                state = RACECAR_STATE.Finished;
                newPos = crossed.scale(1 / spacing)
            }
        }

        // track boundary collision detection
        // * check for crashes last, in case crossing the finish line
        if (state != RACECAR_STATE.Finished) {
            let boundaries = form.getBoundaries();
            let closest = Math.sqrt(750**2 * 2);

            for (let boundary of boundaries) {
                let crossed = route.getIntersection(boundary);
                
                if (crossed) {
                    state = RACECAR_STATE.Crashed;

                    let distance = crossed.sub(route.start).mag();
                    
                    if (distance < closest) {
                        closest = distance;
                        newPos = crossed.scale(1 / spacing);
                    }
                }
            }
        }

        return {
            Position: newPos,
            Velocity: newVel,
            State: state,
            CheckpointIndexes: checkpointIndexes};
    }

    moveRacecar(racecar, acceleration) {
        let result = this.predictMove(racecar, acceleration);
        let position = result.Position;
        let velocity = result.Velocity;
        let state = result.State;
        let cpIndexes = result.CheckpointIndexes

        let path = new Line( racecar.getPosition(), position );

        racecar.setPosition(position);
        racecar.setVelocity(velocity);

        let stats = this.getRacecarStats(racecar);
        stats.setState(state);
        stats.addMove(path, racecar.getVelocity());
        stats.calculateStats();

        // checkpoint order checked backwards: suppose race car passes 4 then 3 in one go
        // * should ONLY count 3, not 4
        let checkpoints = stats.getCheckpoints();

        for (let i = cpIndexes.length - 1; i >= 0; i--) {
            let c = cpIndexes[i];
            let checkpoint = checkpoints[c];
            let inOrder = (c == 0) ? true : checkpoints[c - 1].passed;
            checkpoint.passed = inOrder;
        }
    }

    applyPendingMoves() {
        let racecars = this.#racecars;
        let pendingMoves = this.#pendingMoves;
        let crashed = [];
    
        for (let r = 0; r < racecars.length; r++) {
            let move = pendingMoves[r];
            if (!move) continue;
            
            let racecar = racecars[r];
            let stats = this.getRacecarStats(racecar);
    
            this.moveRacecar(racecar, move);
            
            if (stats.getState() == RACECAR_STATE.Crashed) {
                crashed.push(racecar);
                stats.addCrash();
            }
        }
    
        // TODO: propagate option to host
        if (crashed.length > 0) {
            let playersCrashed = crashed.some(
                r => r.getPlayerType() == PLAYER_TYPE.Player);
    
            let robotsCrashed = crashed.some(
                r => r.getPlayerType() == PLAYER_TYPE.Robot);
    
            let lobbyOptions = this.getLobby().getOptions();
            let autoPlayers = !playersCrashed || (playersCrashed && lobbyOptions["Auto-retry Players"]);
            let autoRobots = !robotsCrashed || (robotsCrashed && lobbyOptions["Auto-retry Robots"]);
    
            /*
            if (autoPlayers && autoRobots) {
                this.retryCrashedRacecars(crashed);
            }
            */

            this.retryCrashedRacecars(crashed);
        }
    
        this.#pendingMoves = [];
        this.#elapsedTime += 1;
        this.#turn = 0;
    }



    // [[ Crash Handling ]] //
    retryCrashedRacecars() {
        let racecars = this.#racecars;

        for (let racecar of racecars) {
            let stats = this.getRacecarStats(racecar);

            if (stats.getState() == RACECAR_STATE.Crashed) {
                stats.setState(RACECAR_STATE.Racing);
                
                // restart from the last move
                let moves = stats.getMoves();
                let lastPath = moves[moves.length - 1].Path;
                let lastPos = lastPath.start;

                racecar.setPosition(lastPos);
                racecar.setVelocity(new Vector2());
            }
        }
    }

    retireCrashedRacecars() {
        let racecars = this.#racecars;

        for (let racecar of racecars) {
            let stats = this.getRacecarStats(racecar);
    
            if (stats.getState() == RACECAR_STATE.Crashed) {
                stats.setState(RACECAR_STATE.Retired);
            }
        }
    }


    // serialisation
    toObject() {
        return {
            lobby: this.#lobby.toObject(),
            track: this.#track.toObject(),
            form: this.#form.toObject(),
            racecars: this.#racecars.map(r => r.toObject()),
            raceStats: this.#raceStats.map(s => s.toObject()),
            spacing: this.#spacing,
            turn: this.#turn,
            elapsedTime: this.#elapsedTime,
            pendingMoves: this.#pendingMoves.map(m => m.toObject())
        };
    }

    static toInstance(object) {
        let instance = new RaceInstance();

        instance.#lobby = Lobby.toInstance(object.lobby);
        instance.#track = Track.toInstance(object.track);
        instance.#form = TrackForm.toInstance(object.form);
        instance.#racecars = object.racecars?.map(r => RaceCar.toInstance(r)) ?? [];
        instance.#raceStats = object.raceStats?.map(s => RaceStats.toInstance(s)) ?? [];
        instance.#spacing = object.spacing;
        instance.#turn = object.turn;
        instance.#elapsedTime = object.elapsedTime;
        instance.#pendingMoves = object.pendingMoves?.map(m => Vector2.toInstance(m)) ?? [];

        return instance;
    }

    toJSON() {
        return this.toObject();
    }
}