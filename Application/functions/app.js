// main application starting point

// SOURCES:
// [1]: Net Ninja, (Jun 23, 2020). "Node.js Crash Course Tutorial #8 - Middleware", [Online Video]. Available at: https://www.youtube.com/watch?v=_GJKAs7A0_4. Accessed: Dec. 18, 2025.
// [2] R. Kapadia, "How to deploy NodeJS application on Firebase | Firebase Functions NodeJS Tutorial | GCP Firebase", YouTube, youtube.com, [Online Video]. Available: https://www.youtube.com/watch?v=WaYPrpOvsZE. Accessed: Apr. 23, 2026.


// [[ Imports ]] //

console.log("Preparing App");


import express from "express";
import pkg from "./package.json" with { type: "json" };
import cors from "cors";

import path from "path";
import { fileURLToPath } from "url";

import mongoose from "mongoose";
import TrackModel from "./models/track.js";
import LeaderboardModel from "./models/leaderboard.js";

import { debug } from "firebase-functions/logger";
import { db } from "./services/firebase-admin.js";
import { ref, onValue } from "firebase/database";
const firebaseDb = db;

import Player from "./src/core/classes/gameplay/player.js";
import Lobby from "./src/core/classes/gameplay/lobby.js";
import Vector2 from "./src/core/classes/geometry/vector2.js";
import Track from "./src/core/classes/track/track.js";
import RaceInstance from "./src/core/classes/gameplay/race-instance.js";
import RobotDeterminer from "./src/core/classes/gameplay/robot-determiner.js";
import PLAYER_TYPE from "./src/core/enums/player-type.js";
import RACECAR_STATE from "./src/core/enums/racecar-state.js";
import Validator from "./src/core/utilities/validator.js";



// [[ App Set Up ]] //

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/core", express.static(path.join(__dirname, "/src/core"))); // core classes etc.

app.set("view cache", false); // so firebase doesn't show old pages
app.disable("view cache");

const { version } = pkg;
app.locals.version = version;

console.log("Directory:", __dirname);



// [[ MongoDB Set Up ]] //

var mongodbReady = false;

function connectToMongoDB() {
    if (mongodbReady) return;

    const uri = "mongodb+srv://admin:bIL1eC1QX8D5RLvR@testcluster.r5ggsoh.mongodb.net/?appName=TestCluster";

    mongoose.connect(uri)
        .then((result) => { 
            console.log("MongoDB Starting");
            mongodbReady = true;
        })
        .catch((error) => {
            console.log(error);
            console.log("[CONNECTING WITHOUT DATABASE!]");
        });
}

connectToMongoDB();



// [[ API Shared Functions ]] //

// lobbies
async function getLobbies() {
    let snapshot = await firebaseDb.ref("lobbies").once("value");
    let lobbies = snapshot.val() || [];

    return lobbies;
}

function createEmptyLobbyWithHost(lobbyId, hostUser, trackId) {
    // NOTE: "hostUser" is a Firebase User object!!!
    // * see initAuth() in firebase.js

    let host = new Player(
        hostUser.uid, 
        hostUser.displayName ?? "Anonymous", 
        PLAYER_TYPE.Player);
    
    let lobby = new Lobby();
    lobby.setId(lobbyId);
    lobby.setHostId(host.getId());
    lobby.setTrackId(trackId);
    lobby.addPlayer(host);

    return lobby;
}

async function getLobbyById(lobbyId) {
    let snapshot = await firebaseDb.ref(`lobbies/${lobbyId}`).once("value");
    let lobbyData = snapshot.val() || null;

    if (lobbyData) {
        return Lobby.toInstance( lobbyData );
    }

    return null;
}

async function createLobbyForPlayer(user, trackId) {
    let lobbyRef = firebaseDb.ref("lobbies").push();
    let lobbyId = lobbyRef.key; // lobbyRef itself is the ID ie. {[lobbyId] = lobby}
    
    let lobby = createEmptyLobbyWithHost(lobbyId, user, trackId);
    lobby.setIsOnline(true);

    await lobbyRef.set( lobby.toObject() );

    return lobby;
}

async function updateLobbyById(id, details) {
    await firebaseDb.ref(`lobbies/${id}`).update( details );
}

async function addPlayerToLobby(lobbyId, player) {
    try {
        let playerId = player.getId();

        let detailsRef = db.ref(`lobbies/${lobbyId}/playerDetails/${playerId}`);
        await detailsRef.update({
            carType: "The Race Car",
            colour: "#ff4040" });

        let playerRef = db.ref(`lobbies/${lobbyId}/players/${playerId}`);
        await playerRef.update( player.toObject() );
        
        return true;

    } catch (error) {
        console.log(error);
        return false
    }
}

// tracks
async function getTracks() {
    let tracks = await TrackModel.find();
    return tracks;
}

async function getTrackById(id) {
    let track = await TrackModel.findById(id);
    return track;
}

async function saveTrack(trackDetails) {
    let result = await new TrackModel(trackDetails).save(); // generates OID
    return result._id;
}

async function updateTrackById(id, trackDetails) {
    await TrackModel.findByIdAndUpdate(id, { "$set": trackDetails });
}

async function deleteTrackById(id) {
    await TrackModel.findByIdAndDelete(id);
}

// leaderboards
async function getLeaderboards() {
    let leaderboards = await LeaderboardModel.find();
    return leaderboards;
}

async function getLeaderboardByTrackId(trackId) {
    let leaderboard = await LeaderboardModel.findById(trackId);
    return leaderboard;
}

// races
async function getRaceById(raceId) {
    let snapshot = await firebaseDb.ref(`/races/${raceId}`).once("value");;

    let raceData = snapshot.val() || null;

    if (raceData) {
        return RaceInstance.toInstance( raceData );
    }

    return raceData;
}

async function createTestRace(trackData, user) {
    // fast tracks lobby system to race 
    
    let raceRef = firebaseDb.ref("races").push();
    let raceId = raceRef.key;

    let track = Track.toInstance(trackData);
    let trackId = track.getId().toString();
    
    let lobby = createEmptyLobbyWithHost(raceId, user, trackId);
    lobby.setIsOnline(false);

    // success
    let players = Object.values(lobby.getPlayers());
    let race = new RaceInstance(lobby, track, 25, players);

    await firebaseDb.ref(`races/${raceId}`).set( race.toObject() );
    
    return raceId;
}

function processRaceMove(raceInstance, racecar, move) {
    // "move" is technically acceleration

    let playerType = racecar.getPlayerType();

    while (raceInstance.isAnyRacecarInState(RACECAR_STATE.Racing)) {
        console.log("Processing for", racecar.getPlayerId());
        console.log(raceInstance.getPendingMoves());

        if (playerType == PLAYER_TYPE.Player) {
            // nothing more
            console.log("Player Move:", move);

        } else if (playerType == PLAYER_TYPE.Robot) {
            let stats = raceInstance.getRacecarStats(racecar);
            
            if (stats.getState() != RACECAR_STATE.Finished) {
                let determiner = new RobotDeterminer(raceInstance);
                move = determiner.determineRobotMove(racecar);
                console.log("Robot Move:", move);

            } else {
                move = null;
            }

        } else if (playerType == PLAYER_TYPE.Ghost) {
            let playerId = racecar.getPlayerId();
            let carType = racecar.getCarType();
            let lobby = raceInstance.getLobby();
            let ghostMoves = lobby.getPlayerDetail(playerId, "moves");
            let elapsedTime = raceInstance.getElapsedTime();
            
            if (elapsedTime < ghostMoves.length) { // ie. race not yet finished
                let ghostMove = ghostMoves[elapsedTime];
                console.log("Ghost Move:", ghostMove);

                let oldVel = racecar.getVelocity()
                let newVel = Vector2.toInstance(ghostMove.Velocity);
                let acc = newVel.sub(oldVel);

                move = acc;

            } else {
                move = null;
            }
        }

        if (move) {
            raceInstance.addPendingMove(racecar, move);
        }

        raceInstance.findNextTurn();
        
        let nextRacecar = raceInstance.getCurrentPlayer()

        if (nextRacecar.getPlayerType() == PLAYER_TYPE.Player) {
            console.log("Next Player:", nextRacecar.getPlayerId());
            break;

        } else {
            racecar = nextRacecar;
            playerType = racecar.getPlayerType();
            console.log("Next Non-Player:", racecar.getPlayerId());
        }
    }

    console.log(raceInstance.isAnyRacecarInState(RACECAR_STATE.Racing));
}

async function updateRace(raceId, race) {
    await db.ref(`/races/${raceId}`).update( race.toObject() );
}



// [[ API Endpoints ]] //

// building
app.post("/api/builder/test/:trackId", async (request, response) => {
    try {
        let trackId = request.params.trackId;
        let user = request.body.user;
        
        // missing data
        if (!trackId || !user) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        let track = await getTrackById(trackId);

        // non-existing track
        if (!track) {
            return response.status(404).json({ success: false, error: `No track exists with ID ${trackId}` });
        }

        // forbidden access
        if (track.authorId != user.uid) {
            return response.status(403).json({ success: false, error: `Only the track author can test the track` });
        }

        // valid
        let raceId = await createTestRace(track, user);

        console.log(raceId);

        return response.status(200).json({ success: true, raceId });
    
    } catch (error) {
        console.log(error);
        response.status(500).json({ success: false, error: `There was a server error, please try again: ${error}` });   
    }
});


// lobbies
app.get("/api/lobbies", async (request, response) => {
    try {
        let lobbies = await getLobbies();
        response.status(200).json({ success: true, lobbies });

    } catch (error) {
        console.log(error)
        response.status(500).json({ success: false,  });
    }
});

app.post("/api/lobbies", async (request, response) => {
    try {
        let { user, trackId, isOnline } = request.body;

        // missing data
        if (!user || !trackId || isOnline == null) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        let track = await getTrackById(trackId);

        // non-existing track
        if (!track) {
            return response.status(404).json({ success: false, error: "Track not found" });
        }

        // success: lobby creation
        let lobby = await createLobbyForPlayer(user, trackId, isOnline);
        let lobbyId = lobby.getId();
        lobby.setIsOnline(isOnline);

        response.status(201).json({ success: true, lobbyId });
    
    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});

app.patch("/api/lobbies/:lobbyId", async (request, response) => {
    try {
        let lobbyId = request.params.lobbyId;

        // missing data
        if (!lobbyId) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        // success
        let { details } = request.body;
        
        await updateLobbyById(lobbyId, details);

        response.status(200).json({ success: true });

    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});

app.post("/api/lobbies/join/:lobbyId", async (request, response) => {
    try {
        let lobbyId = request.params.lobbyId;
        let user = request.body.user;
        
        // missing data
        if (!lobbyId || !user.uid) {
            return response.status(400).json({ success: false, error: "Missing data" });;
        }

        let lobby = await getLobbyById(lobbyId);

        // non-existing lobby
        if (!lobby) {
            return response.status(400).json({ success: false, error: `No lobby exists with ID ${lobbyId}` });
        }
        
        // valid (only if they aren't already in)
        // * it's fine if not - just avoids repeat it
        if (!lobby.getPlayers()[user.uid]) {
            let player = new Player(user.uid, user.displayName ?? "Anonymous", PLAYER_TYPE.Player);
            await addPlayerToLobby(lobbyId, player);
        }

        response.status(200).json({ success: true });

    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});

app.post("/api/lobbies/start/:lobbyId", async (request, response) => {
    try {
        let { lobbyId, user } = request.body;

        // missing data
        if (!lobbyId || !user) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        let lobby = await getLobbyById(lobbyId);

        // non-existing lobby
        if (!lobby) {
            return response.status(404).json({ success: false, error: `No lobby exists with ID ${lobbyId}` });
        }

        // no start permissions
        if (user.uid != lobby.getHostId()) {
            return response.status(403).json({ success: false, error: "Only the host can start the lobby" });
        }

        let trackData = await getTrackById(lobby.getTrackId());
        let track = Track.toInstance(trackData);

        // success
        let players = Object.values(lobby.getPlayers());
        let race = new RaceInstance(lobby, track, 25);

        let first = race.getCurrentPlayer();

        if (first.getPlayerType() != PLAYER_TYPE.Player) {
            processRaceMove(race, race.getCurrentPlayer(), null);
        }

        await firebaseDb.ref(`races/${lobbyId}`).set( race.toObject() );
        await firebaseDb.ref(`lobbies/${lobbyId}`).remove();
        
        response.status(200).json({ success: true, raceId: lobbyId });

    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});


// tracks
app.get("/api/tracks", async (request, response) => {
    debug(mongodbReady, request.path);

    if (!mongodbReady) {
        return response.status(503).json({ success: false, error: "Database is unavailable" });
    }

    try {
        let tracks = await getTracks();
        response.status(200).json({ success: true, tracks });

    } catch (error) {
        console.log(error);
        response.status(500).json({ success: false, error });
    }
});

app.post("/api/tracks", async (request, response) => {
    if (!mongodbReady) {
        return response.status(503).json({ success: false, error: "Database is unavailable" });
    }

    try {
        let trackDetails = request.body;

        // missing data
        if (!trackDetails) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        // saving
        let id = await saveTrack(trackDetails);

        response.status(200).json({ success: true, id });

    } catch(error) {
        console.log(`Track save failed: "${error}"`);
        response.status(500).json({ success: false, error });
    }
});

app.get("/api/tracks/:trackId", async (request, response) => {
    if (!mongodbReady) {
        return response.status(503).json({ success: false, error: "Database is unavailable" });
    }
    
    try {
        let trackId = request.params.trackId;

        // missing data
        if (!trackId) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        let track = await getTrackById(trackId);

        // non-existing track
        if (!track) {
            return response.status(404).json({ sucess: false, error: `No track exists with ID ${trackId}` });
        }

        // success
        response.status(200).json({ success: true, track });

    } catch (error) {
        console.log(error);
        response.status(500).json({ success: false, error });
    }
});

app.patch("/api/tracks/:trackId", async (request, response) => {
    if (!mongodbReady) {
        return response.status(503).json({ success: false, error: "Database is unavailable" });
    }

    try {
        let trackId = request.params.trackId;
        let trackDetails = request.body;

        // missing data
        if (!trackId || !trackDetails) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        // updating
        await updateTrackById(trackId, trackDetails);

        response.status(200).json({ success: true });

    } catch(error) {
        console.log(`Track save failed: "${error}"`);
        response.status(500).json({ success: false, error });
    }
});

app.delete("/api/tracks/:trackId", async (request, response) => {
    if (!mongodbReady) {
        return response.status(503).json({ success: false, error: "Database is unavailable" });
    }
    
    try {
        let trackId = request.params.trackId;
        let playerId = request.query.playerId;

        // missing data
        if (!trackId || !playerId) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        let track = await getTrackById(trackId);

        if (!track) {
            return response.status(404).json({ success: false, error: "The track to delete does not exist" });
        }

        let authorId = track.authorId;
        let author = track.author;

        // forbidden access
        if (playerId != authorId || author == "Game") {
            response.status(403).json({ success: false, error: "Only the owner of the track can delete the track" });
        }

        await deleteTrackById(trackId);
        
        response.status(200).json({ success: true });
    
    } catch(error) {
        console.log(error);
        response.status(500).json({ success: false, error });
    }
});


// leaderboards
app.get("/api/leaderboards", async (request, response) => {
    if (!mongodbReady) {
        return response.status(503).json({ success: false, error: "Database is unavailable" });
    }

    let leaderboards = await getLeaderboards();

    if (leaderboards.length == 0) {
        response.status(204).json({ success: true, leaderboards: [] });

    } else {
        response.status(200).json({ success: true, leaderboards });
    }
});

app.get("/api/leaderboards/:trackId", async (request, response) => {
    if (!mongodbReady) {
        return response.status(503).json({ success: false, error: "Database is unavailable" });
    }

    try {
        let trackId = request.params.trackId;

        // missing data
        if (!trackId) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        let leaderboard = await getLeaderboardByTrackId(trackId);

        // no existing leaderboard
        if (!leaderboard) {
            return response.status(200).json({ success: true, leaderboard: null });
        }

        // success
        response.status(200).json({ success: true, leaderboard });
    
    } catch (error) {
        console.log(error)
        response.status(500).json({ success: false, error });
    }
});

app.post("/api/leaderboards/:trackId", async (request, response) => {
    if (!mongodbReady) {
        return response.status(503).json({ success: false, error: "Database is unavailable" });
    }

    try {
        let trackId = request.params.trackId;
        let { player, time, carType, moves } = request.body;

        if (!trackId || !player || !time || !carType || !moves) {
            return response.status(400).json({ success: false, error: "Not using database" });
        }

        let { id, name } = player;
        let scorePath = `scores.${id}.${carType}`;

        let filter = { _id: trackId };

        let update = [{ 
            $set: { // single op: only update for first / better times
                [scorePath]: {
                    $cond: [
                        {
                            $or: [
                                { $not: [`$${scorePath}`] },
                                { $gt: [`$${scorePath}.time`, time] }
                            ]
                        },
                        {
                            name, time, moves, date: new Date()
                        },
                        `$${scorePath}`
                    ]
                }
            }
        }];

        let options = { upsert: true, updatePipeline: true, returnDocument: "before" };

        let lbBefore = await LeaderboardModel.findOneAndUpdate(
            filter, update, options);

        let oldTime = lbBefore?.scores?.get(id)?.get(carType)?.time ?? null;

        response.status(200).json({ success: true, oldTime, newTime: time });

    } catch (error) {
        console.log(error);
        response.status(500).json({ success: false, error });
    }
});


// races
app.get("/api/races/:raceId", async (request, response) => {
    try {
        let raceId = request.params.raceId;
        
        // missing data
        if (!raceId) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        let race = await getRaceById(raceId);

        // non-existing race
        if (!race) {
            return response.status(404).json({ success: false, error: `No race exists with ID ${raceId}` });
        }

        // success
        response.status(200).json({ success: true, race });

    } catch (error) {
        console.log(error);
        response.status(500).json({ success: false, error });
    }
});

app.post("/api/races/:raceId/move", async (request, response) => {
    try {
        let raceId = request.params.raceId;
        let playerId = request.query.playerId;
        let { move } = request.body;

        if (!raceId || !playerId || !move) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        try {
            move = Vector2.toInstance(move);

        } catch (error) {
            return response.status(400).json({ success: false, error: `"${move}" is not in valid Vector2 format`});
        }

        let race = await getRaceById(raceId);

        if (!race) {
            return response.status(400).json({ success: false, error: "The race no longer exists" });
        }

        let target = race.getCurrentPlayer();
        let targetId = target.getPlayerId();

        if (targetId != playerId) {
            return response.status(403).json({ success: false, error: `Player "${playerId}" cannot take the turn of Player "${targetId}"`})
        }

        processRaceMove(race, target, move);

        updateRace(raceId, race);

        response.status(200).json({ success: true });

    } catch (error) {
        console.log(error);
        response.status(500).json({ success: false, error });
    }
});



// [[ App Webpage Views ]] //

app.get("/", (request, response) => {
    response.render("home", { title: "Home" });
});

app.get("/builder", (request, response) => {
    response.render("builder", { title: "Track Builder", trackToLoad: null });
});

app.get("/builder/:trackId", async (request, response) => {
    try {
        let trackId = request.params.trackId;

        // missing data
        if (!trackId) {
            return response.status(400).json({ success: false, error: "Missing track ID." });
        }

        let track = await getTrackById(trackId);

        // non-existing track
        if (!track) {
            return response.status(404).json({ success: false, error: `No track exists with ID ${trackId}.` });
        }

        // success
        response.render("builder", { title: "Track Builder", trackToLoad: track });
    
    } catch (error) {
        response.status(500).json({ success: false, error: `There was a server error, please try again: ${error}` });
    }
});

app.get("/tracks", async (request, response) => {
    try {
        let tracks = await getTracks();
        let leaderboards = await getLeaderboards();

        response.render("tracks", { title: "Tracks List", tracks, leaderboards });
    
    } catch (error) {
        console.log(error);
        response.status(500).json({ success: false, error: `Failed to load tracks: ${error}` });
    }
});

app.get("/lobbies", async(request, response) => {
    try {
        let lobbies = await getLobbies();
        response.render("lobbies", {title: "Lobbies", lobbies });

    } catch (error) {
        console.error(error);
        response.status(500).send({ success: false, error: `Failed to load lobbies: ${error}` });
    }
});

app.get("/lobbies/:lobbyId", async (request, response) => {
    try {
        let lobbyId = request.params.lobbyId;

        // missing data
        if (!lobbyId) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        let lobby = await getLobbyById(lobbyId);

        // non-existing lobby
        if (lobby) {
            return response.render("lobby", { title: "Lobby (Online)", lobby });
        
        } else {
            response.redirect("/lobbies");
        }
    
    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error: `There was a server error: ${error}` });
    }
});

app.get("/races/:raceId", async (request, response) => {
    try {
        let raceId = request.params.raceId;
        
        // missing data
        if (!raceId) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        let race = await getRaceById(raceId);

        // non-existing race
        if (!race) {
            return response.redirect("/tracks");
        }

        // success
        response.render("race", { title: "Race", raceId });

    } catch (error) {
        console.log(error);
        response.status(500).json({ success: false, error: `There was a server error: ${error}` });
    }
});


// missing page (404)
app.use((request, response) => {
    if (request.path.startsWith("/api")) {
        return response.status(404).json({ success: false, error: `"${request.path}" is not an endpoint`});
    }

    response.render("error-404", { title: "404 Not Found" });
});


export const appExpress = app;  // firebase
export default app;             // basic node