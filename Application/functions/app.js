// main application starting point

// SOURCES:
// [1]: Net Ninja, (Jun 23, 2020). "Node.js Crash Course Tutorial #8 - Middleware", [Online Video]. Available at: https://www.youtube.com/watch?v=_GJKAs7A0_4. Accessed: Dec. 18, 2025.
// [2] R. Kapadia, "How to deploy NodeJS application on Firebase | Firebase Functions NodeJS Tutorial | GCP Firebase", YouTube, youtube.com, [Online Video]. Available: https://www.youtube.com/watch?v=WaYPrpOvsZE. Accessed: Apr. 23, 2026.


// [[ Imports ]] //

console.log("Preparing App (3)");


import express from "express";
import pkg from "../package.json" with { type: "json" };
import cors from "cors";

import path from "path";
import { fileURLToPath } from "url";

import mongoose from "mongoose";
import TrackModel from "./models/track.js";
import LeaderboardModel from "./models/leaderboard.js";

import { debug } from "firebase-functions/logger";
import { db } from "./services/firebase-admin.js";
const firebaseDb = db;

import Player from "./src/core/classes/gameplay/player.js";
import Lobby from "./src/core/classes/gameplay/lobby.js";
import Vector2 from "./src/core/classes/geometry/vector2.js";
import Track from "./src/core/classes/track/track.js";
import RaceInstance from "./src/core/classes/gameplay/race-instance.js";
import RobotDeterminer from "./src/core/classes/gameplay/robot-determiner.js";
import PLAYER_TYPE from "./src/core/enums/player-type.js";
import Validator from "./src/core/utilities/validator.js";


let offlineLobbies = [];
let offlineRaces = [];



// [[ App Set Up ]] //

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public"))); // pages, styles, etc.
app.use("/core", express.static(path.join(__dirname, "/src/core"))); // core classes etc.

const { version } = pkg;
app.locals.version = version;

var usingFirebase = true;



// [[ MongoDB Set Up ]] //

var mongodbReady = false;

const uri = "mongodb+srv://admin:bIL1eC1QX8D5RLvR@testcluster.r5ggsoh.mongodb.net/?appName=TestCluster";
mongoose.connect(uri)
    .then((result) => { 
        console.log("MongoDB Starting"); // note: "1" = connected
        console.log("MongoDB State:", mongoose.connection.readyState); 
        mongodbReady = true;
    })
    .catch((error) => {
        console.log(error);
        console.log("[CONNECTING WITHOUT DATABASE!]");
    });

// NB: only use "app.listen" when running without firebase
// * see "Application/server.js" for local running
// * firebase will make its own front end link
// * use module.exports = app when using firebase (see bottom)



// [[ API Shared Functions ]] //

// general lobbies
async function getLobbies() {
    if (usingFirebase) {
        let snapshot = await firebaseDb.ref("lobbies").once("value");
        let lobbies = snapshot.val() || [];

        return lobbies;

    } else {
        return null;
    }
}

function createEmptyLobbyWithHost(lobbyId, hostId, trackId) {
    // * corresponds to Lobby object
    // * TODO: figure out how to get Lobby class in here

    let host = new Player(hostId, "", PLAYER_TYPE.Player);
    
    let lobby = new Lobby();
    lobby.setId(lobbyId);
    lobby.setHostId(hostId);
    lobby.setTrackId(trackId);
    lobby.addPlayer(host);

    return lobby;
}

// online lobbies
async function getOnlineLobbyById(lobbyId) {
    let snapshot = await firebaseDb.ref(`lobbies/${lobbyId}`).once("value");
    let lobbyData = snapshot.val() || null;

    if (lobbyData) {
        return Lobby.toInstance( lobbyData );
    }

    return null;
}

async function createOnlineLobbyForPlayer(playerId, trackId) {
    let lobbyRef = firebaseDb.ref("lobbies").push();
    let lobbyId = lobbyRef.key; // lobbyRef itself is the ID ie. {[lobbyId] = lobby}
    
    let lobby = createEmptyLobbyWithHost(lobbyId, playerId, trackId);

    await lobbyRef.set( lobby.toObject() );

    return lobby;
}

async function updateOnlineLobbyById(id, details) {
    await firebaseDb.ref(`lobbies/${id}`).update( details );
}

async function addPlayerToOnlineLobby(lobbyId, player) {
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

// offline lobby
function getOfflineLobbyById(lobbyId) {
    let lobby = offlineLobbies.find(l => l.getId() == lobbyId);

    return lobby;
}

function createOfflineLobbyForPlayer(playerId, trackId) {
    let id = 0;
    do {
        let exists = offlineLobbies.find(l => l.getId() == id);
        if (exists != undefined) id += 1; else break;
    } while (true)
    
    let lobbyId = id.toString();

    let lobby = createEmptyLobbyWithHost(lobbyId, playerId, trackId);

    offlineLobbies.push(lobby);

    return lobby;
}

// tracks
async function getTracks() {
    let tracks = await TrackModel.find();
    return tracks;
}

async function getTrackById(id) {
    let track = await TrackModel.findById( id );
    return track;
}

async function saveTrackById(id, trackDetails) {
    if (id) { // ie. new track
        await TrackModel.findByIdAndUpdate(id, { "$set": trackDetails });
        
    } else {
        await new TrackModel(trackDetails).save(); // generates OID
    }
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
async function getOnlineRaceById(raceId) {
    let snapshot = await firebaseDb.ref(`/races/${raceId}`).once("value");;

    let raceData = snapshot.val() || null;

    if (raceData) {
        return RaceInstance.toInstance( raceData );
    }

    return raceData;
}

function getOfflineRaceById(raceId) {
    let race = offlineRaces.find(r => r.getId() == raceId);
    return race;
}

function processRaceMove(raceInstance, racecar, move) {
    let playerType = racecar.getPlayerType();
    // "move" is technically acceleration

    if (playerType == PLAYER_TYPE.Player) {
        raceInstance.addPendingMove(racecar, move);

    } else if (playerType == PLAYER_TYPE.Robot) {
        move = determineRobotMove(racecar);
    
    } else if (playerType == PLAYER_TYPE.Ghost) {
        let playerId = racecar.getPlayerId();
        let carType = racecar.getCarType();
        let moves = leaderboard.scores[playerId][carType].moves;
        let move = moves[timeElapsed];

        let oldVel = racecar.getVelocity()
        let newVel = Vector2.toInstance(move.Velocity);
        let acc = newVel.sub(oldVel);

        move = acc;
    }

    raceInstance.addPendingMove(racecar, move);
    raceInstance.findNextTurn();
}

async function updateRace(raceId, race) {
    await db.ref(`/races/${raceId}`).update( race.toObject() );
}



// [[ API Endpoints ]] //

// lobbies
app.post("/api/lobbies/offline", async (request, response) => {
    try {
        let { playerId, trackId } = request.body;

        // missing data
        if (!playerId || !trackId) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        // valid
        let lobby = await createOfflineLobbyForPlayer(playerId, trackId);
        let lobbyId = lobby.getId();

        response.status(201).json({ success: true, lobbyId });

    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});

app.post("/api/lobbies/online", async (request, response) => {
    try {
        let { playerId, trackId } = request.body;

        // missing data
        if (!playerId || !trackId) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        let track = await getTrackById(trackId);

        // non-existing track
        if (!track) {
            return response.status(404).json({ success: false, error: "Track not found" });
        }

        // success: lobby creation
        let lobby = await createOnlineLobbyForPlayer(playerId, trackId);
        let lobbyId = lobby.getId();

        response.status(201).json({ success: true, lobbyId });
    
    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});

app.get("/api/lobbies", async (request, response) => {
    try {
        let lobbies = await getLobbies();
        response.status(200).json({ success: true, lobbies });

    } catch (error) {
        console.log(error)
        response.status(500).json({ success: false,  });
    }
});

app.patch("/api/lobbies/:lobbyId/online", async (request, response) => {
    try {
        let lobbyId = request.params.lobbyId;

        // missing data
        if (!lobbyId) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        // success
        let { details } = request.body;

        await updateOnlineLobbyById(lobbyId, details);

        response.status(200).json({ success: true });

    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});

app.patch("/api/lobbies/:lobbyId/offline", async (request, response) => {
    try {
        let lobbyId = request.params.lobbyId;

        // missing data
        if (!lobbyId) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        // success
        let { details } = request.body;
        let updated = Lobby.toInstance(details);

        let index = offlineLobbies.findIndex(l => l.getId() == lobbyId);
        offlineLobbies[index] = updated;

        response.status(200).json({ success: true });

    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});

app.post("/api/lobbies/join/:lobbyId", async (request, response) => {
    try {
        let lobbyId = request.params.lobbyId;
        let playerId = request.body.playerId;
        
        // missing data
        if (!lobbyId || !playerId) {
            return response.status(400).json({ success: false, error: "Missing data" });;
        }

        let lobby = await getOnlineLobbyById(lobbyId);

        // non-existing lobby
        if (!lobby) {
            return response.status(400).json({ success: false, error: `No lobby exists with ID ${lobbyId}` });
        }
        
        // valid (only if they aren't already in)
        // * it's fine if not - just avoids repeat it
        if (!lobby.getPlayers()[playerId]) {
            let player = new Player(playerId, "", PLAYER_TYPE.Player);
            await addPlayerToOnlineLobby(lobbyId, player);
        }

        response.status(200).json({ success: true });

    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});

app.post("/api/lobbies/start/:lobbyId", async (request, response) => {
    try {
        let { lobbyId, playerId } = request.body;

        // missing data
        if (!lobbyId || !playerId) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        let online = true;
        let lobby = await getOnlineLobbyById(lobbyId);

        // non-existing lobby
        if (!lobby) {
            online = false;
            lobby = getOfflineLobbyById(lobbyId);

            if (!lobby) {
                return response.status(404).json({ success: false, error: `No lobby exists with ID ${lobbyId}` });
            }
        }

        // no start permissions
        if (playerId != lobby.getHostId()) {
            return response.status(403).json({ success: false, error: "Only the host can start the lobby" });
        }

        let trackData = await getTrackById(lobby.getTrackId());
        let track = Track.toInstance(trackData);

        // success
        let players = Object.values(lobby.getPlayers());
        let race = new RaceInstance(lobby, track, 25, players);

        if (online) {
            await firebaseDb.ref(`races/${lobbyId}`).set( race.toObject() );
            await firebaseDb.ref(`lobbies/${lobbyId}`).remove();
        
        } else {
            let index = offlineLobbies.findIndex(l => l.getId() == lobby.getId());
            offlineLobbies.splice(index, 1);
            offlineRaces.push(race);
        }
        
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
        let trackDetails = request.body;

        // missing data
        if (!trackDetails) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        // saving
        let success = await saveTrackById(track._id, trackDetails);

        if (!success) {
            return response.status(500).json({ success: false, error: "Something went wrong when saving the track" });
        }

        response.status(200).json({ success: true });

    } catch(error) {
        console.log(`[Track Builder] Track save failed: "${error}"`);
        response.status(400).json({ success: false, error });
    }
});

app.delete("/api/tracks/:trackId", async (request, response) => {
    if (!mongodbReady) {
        return response.status(503).json({ success: false, error: "Database is unavailable" });
    }
    
    try {
        let trackId = request.params.trackId;

        // missing data
        if (!trackId) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        let track = await getTrackById(id);
        let author = track.author;

        // forbidden access
        // * TODO: use Player IDs instead!
        if (author == "" || author == "Game") {
            response.status(403).json({ success: false, error: "Only the owner of the track can delete the track" });
            response.redirect("/tracks/list");
        }

        let success = deleteTrackById(trackId);

        if (!success) {
            return response.status(500).json({ success: false, error: "Something went wrong when deleting the track" });
        }
        
        response.redirect("/tracks/list");
    
    } catch(error) {
        console.log(error);
        response.status(500).json({ success: false, error: error });
    }
});


// leaderboards
app.get("/api/leaderboards", async (request, response) => {
    if (!mongodbReady) {
        return response.status(503).json({ success: false, error: "Database is unavailable" });
    }

    let leaderboards = await getLeaderboards();

    if (leaderboards.length == 0) {
        response.status(204).json({ success: true, leaderboards });

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
            return response.status(400).json({ success: false, error: `No leaderboard exists for Track ID ${trackId}` });
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
        let { time, carType, moves } = request.body;

        if (!trackId || !time || !carType || !moves) {
            return response.status(400).json({ success: false, error: "Not using database" });
        }

        let name = "player";
        let scorePath = `scores.${name}.${carType}`;

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
                            time, moves, date: new Date()
                        },
                        `$${scorePath}`
                    ]
                }
            }
        }];

        let options = { upsert: true, updatePipeline: true, returnDocument: "before" };

        let lbBefore = await LeaderboardModel.findOneAndUpdate(
            filter, update, options);

        let oldTime = lbBefore?.scores?.get(name)?.get(carType)?.time ?? null;

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

        let race = await getOnlineRaceById(raceId);

        // non-existing race
        if (!race) {
            race = getOfflineRaceById(raceId);

            if (!race) {
                return response.status(404).json({ success: false, error: `No race exists with ID ${raceId}` });
            }
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

        let race = await getOnlineRaceById(raceId);
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

        // no permission to edit
        // * TODO: use Player IDs instead!
        if (track.author == "" || author == "Game") {
            return response.status(403).json({ success: false, error: "Only the author can edit the track." });
        }

        // success
        response.render("builder", { title: "Track Builder", trackToLoad });
    
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

        let isOnline = true;
        let lobby = await getOnlineLobbyById(lobbyId);

        // non-existing lobby
        if (lobby) {
            return response.render("lobby", { title: "Lobby (Online)", lobby, isOnline });
        
        } else {
            isOnline = false;
            lobby = await getOfflineLobbyById(lobbyId);

            if (lobby) {
                return response.render("lobby", { title: "Lobby (Offline)", lobby, isOnline });   
            }
        }

        response.redirect("/lobbies");
    
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

        let race = await getOnlineRaceById(raceId);

        // non-existing race
        if (!race) {
            race = getOfflineRaceById(raceId);

            if (!race) {
                return response.redirect("/tracks");
            }
        }

        // success
        response.render("race", { title: "Race", raceId });

    } catch (error) {
        console.log(error);
        response.status(500).json({ success: false, error: `There was a server error: ${error}` });
    }
});

app.get("/settings", (request, response) => {
    response.render("settings", { title: "Settings" } );
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