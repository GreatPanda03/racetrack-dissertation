// helper class to calculate robot moves

import Vector2 from "../geometry/vector2.js";
import RaceInstance from "./race-instance.js";
import RACECAR_STATE from "../../enums/racecar-state.js";
import Validator from "../../utilities/validator.js";


export default class RobotDeterminer {
    #raceInstance;

    constructor(raceInstance) {
        Validator.isInstance(raceInstance, RaceInstance);

        this.#raceInstance = raceInstance;
    }


    // getters / setters
    getRaceInstance() { return this.#raceInstance; }
    setRaceInstance(raceInstance) {
        Validator.isInstance(raceInstance, RaceInstance);
        this.#raceInstance = raceInstance;
    }


    // methods
    determineRobotMove(racecar) {
        let raceInstance = this.#raceInstance;

        let spacing = raceInstance.getSpacing();
        let form = raceInstance.getForm();
        let centre = form.getCentre();
    
        let finalMove;
        
        let racecars = raceInstance.getRacecars();
        let lobby = raceInstance.getLobby();
        let level = lobby.getPlayerDetail(racecar.getPlayerId(), "level");
    
        function getClosestSegmentIndex(position) {
            let closest = -1;
            let bestDistance = Math.sqrt(2 * 750**2);
    
            centre.forEach((segment, s) => {
                let distance = segment.toPoint(position);
    
                if (distance < bestDistance) {
                    bestDistance = distance;
                    closest = s;
                }
            });
    
            return closest;
        }
    
        // [source 1] returns the distance between two indexes
        // * since segment indexes loop around (esp. in looped tracks)
        function shorterDirection(current, next) {
            let count = centre.length;
            let toRight = (next + count - current) % count;
    
            return toRight > count / 2 ? -(count - toRight) : toRight; // left / right
        }
    
        // race car score relative to position along track
        function getMoveScore(move) {
            let pos = racecar.getPosition();
            let oldUiPos = pos.scale(spacing);
            let initial = getClosestSegmentIndex(oldUiPos); 
    
            let predict = raceInstance.predictMove(racecar, move.Offset);
    
            let newPos = predict.Position;
            let newUiPos = newPos.scale(spacing);
            let closest = getClosestSegmentIndex(newUiPos);
    
            let segment = centre[closest];
            let distance = segment.toPoint(newUiPos);
            distance = Math.max(distance, 1);
    
            // score: rewards progressions close to the centre line
            // * lower score for moving backwards, but not "penalised"
            let progress = shorterDirection(initial, closest);
            let score = Math.log(1 / distance) + progress;
    
            let favour = favours[predict.State];
            if (favour) score += favour;
    
            // console.log(initial, closest, progress, score);
    
            return score;
        }
    
        // looks ahead to find the best sequence of moves to make
        let favours = {
            [RACECAR_STATE.Crashed]:  -10,
            [RACECAR_STATE.Finished]:  100
        } 
    
        let deterministic = level >= 4;
        let maxDepth;
        let depth;
        let randomRisk;
        // # of predicted moves beyond the first move
    
        if (deterministic) {
            maxDepth = 3;
            depth = 3;
            randomRisk = 0;
        } else {
            maxDepth = level;
            depth = Math.ceil(Math.random() * maxDepth);
            randomRisk = 1 / 2**(level == 0 ? 1 : level);
        }
    
        function runRecursion(d) {
            let moves = raceInstance.getPossibleMoves(racecar);
            let bestScore = -100;
    
            for (let move of moves) {
                if (!move.Active) continue;
    
                let score = getMoveScore(move);
    
                if (d > 0) {
                    let originalPos = racecar.getPosition();
                    let originalVel = racecar.getVelocity();
    
                    let next = raceInstance.predictMove(racecar, move.Offset);
    
                    if (next.State == RACECAR_STATE.Crashed) { // simulate crash
                        racecar.setPosition(originalPos);
                        racecar.setVelocity(new Vector2());
    
                    } else {
                        racecar.setPosition(next.Position);
                        racecar.setVelocity(next.Velocity);
                    }
    
                    score += runRecursion(d - 1);
                    
                    if (Math.random() < randomRisk) {
                        score += Math.abs(score) * 0.25;
                    }
    
                    racecar.setPosition(originalPos); // hacky reset per move (TODO)
                    racecar.setVelocity(originalVel);
                }
    
                if (score > bestScore) {
                    bestScore = score;
                    if (d == depth) finalMove = move.Offset;
                }
            }
    
            return bestScore;
        }
    
        runRecursion(depth);
    
        return finalMove;
    }
}