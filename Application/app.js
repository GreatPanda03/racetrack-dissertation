// main application starting point

// SOURCES:
// * [source 1]: Net Ninja, (Jun 23, 2020). "Node.js Crash Course Tutorial #8 - Middleware", [Online Video]. Available at: https://www.youtube.com/watch?v=_GJKAs7A0_4. Accessed: Dec. 18, 2025.


// [[ Imports ]] //

const express = require("express");
const { version } = require("./package.json");

const mongoose = require("mongoose");
const TrackModel = require("./models/track");
const LeaderboardModel = require("./models/leaderboard");

const { gameTracks } = require("./src/track-repository");
const PLAYER_TYPE = require("./src/core/enums/player-type").default;
const Validator = require("./src/core/utilities/validator");

const { db } = require("./services/firebase-admin");
const firebaseDb = db;

let offlineLobbies = [];
let offlineRaces = [];



// [[ App Set Up ]] //

const app = express();
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.static("public")); // static resources
app.use("/core", express.static("src/core")); // core classes etc.

// environment variables
app.use((request, response, next) => {
    response.locals.version = version;
    next();
});

var usingFirebase = true;



// [[ MongoDB Set Up ]] //

var usingDb = true;

if (usingDb) {
    const uri = "mongodb+srv://admin:bIL1eC1QX8D5RLvR@testcluster.r5ggsoh.mongodb.net/?appName=TestCluster";
    mongoose.connect(uri)
        .then((result) => app.listen(3000))
        .catch((error) => {
            console.log(error);
            console.log("[CONNECTING WITHOUT DATABASE!]");
            usingDb = false;
            app.listen(3000);
        });

} else {
    app.listen(3000);
    console.log("RUNNING WITHOUT DATABASE!");
}



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

function createEmptyLobbyWithHost(lobbyId, playerId, trackId) {
    // * corresponds to Lobby object
    // * TODO: figure out how to get Lobby class in here
    let lobby = { 
        id: lobbyId,
        hostId: playerId, 
        trackId, 
        players: {
            [playerId]: {id: playerId, playerType: PLAYER_TYPE.Player} 
        },
        playerDetails: {
            [playerId]: {colour: "#ff4040", carType: "The Race Car"}
        }
    };

    return lobby;
}

// online lobbies
async function getOnlineLobbyById(lobbyId) {
    let snapshot = await firebaseDb.ref(`lobbies/${lobbyId}`).once("value");
    let lobby = snapshot.val() || null;

    return lobby;
}

async function createOnlineLobbyForPlayer(playerId, trackId) {
    let host = {id: playerId, playerType: PLAYER_TYPE.Player}
    
    let lobbyRef = firebaseDb.ref("lobbies").push();
    let lobbyId = lobbyRef.key; // lobbyRef itself is the ID ie. {[lobbyId] = lobby}
    
    let lobby = createEmptyLobbyWithHost(lobbyId, playerId, trackId);

    await lobbyRef.set( lobby );

    return lobbyId;
}

async function updateOnlineLobbyById(id, details) {
    await firebaseDb.ref(`lobbies/${id}`).update( details );
}

async function addPlayerToOnlineLobby(lobbyId, playerId) {
    try {
        let result = await db.ref(`lobbies/${lobbyId}/players/${playerId}`).update({
            id: playerId,
            playerType: PLAYER_TYPE.Player
        });

        return true;

    } catch (error) {
        console.log(error);
        return false
    }
}

// offline lobby
function getOfflineLobbyById(lobbyId) {
    let lobby = offlineLobbies.find(l => l.id == lobbyId);

    return lobby;
}

function createOfflineLobbyForPlayer(playerId, trackId) {
    let id = 0;
    do {
        let exists = offlineLobbies.find(l => l.id == id);
        if (exists != undefined) id += 1; else break;
    } while (true)
    
    let lobbyId = id.toString();

    let lobby = createEmptyLobbyWithHost(lobbyId, playerId, trackId);

    offlineLobbies.push(lobby);

    return lobbyId;
}

// tracks
async function getTracks() {
    if (usingDb) {
        let tracks = await TrackModel.find();
        return tracks;
    
    } else {
        let tracks = gameTracks;
        return tracks;
    }
}

async function getTrackById(id) {
    if (usingDb) {
        let track = await TrackModel.findById( id );
        return track;
    
    } else {
        let track = gameTracks.find(t => JSON.parse(t)._id == id );

        if (track) {
            return track;
        }
    }
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
    if (usingDb) {
        return await LeaderboardModel.find();
    
    } else {
        return null;
    }
}

async function getLeaderboardByTrackId(trackId) {
    if (usingDb) {
        return await LeaderboardModel.findById(trackId);
    
    } else {
        return null;
    }
}

// races
function getOnlineRaceById(raceId) {
    
}

function getOfflineRaceById(raceId) {
    let race = offlineRaces.find(r => r.id == raceId);
    return race;
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
        let lobbyId = await createOfflineLobbyForPlayer(playerId, trackId);
    
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
        let lobbyId = await createOnlineLobbyForPlayer(playerId, trackId);

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

        let index = offlineLobbies.findIndex(l => l.id == lobbyId);
        offlineLobbies[index] = details;

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

        // valid
        let playerData = {[playerId]: {
            carType: "The Race Car", 
            colour: "#aa0000"}};
        
        let detailsRef = db.ref(`/lobbies/${lobbyId}/playerDetails/${playerId}`)
        await detailsRef.update(data);

        response.status(200).json({ success: true });

    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});

// TODO: handle offline lobbies as well
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
        if (playerId != lobby.hostId) {
            return response.status(403).json({ success: false, error: "Only the host can start the lobby" });
        }

        // success
        let raceRef = firebaseDb.ref(`races/${lobbyId}`);
        let race = lobby;

        if (online) {
            await raceRef.set(race);
            await firebaseDb.ref(`lobbies/${lobbyId}`).remove();
        
        } else {
            let index = offlineLobbies.findIndex(l => l.id == lobby.id);
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
app.get("/api/tracks/:trackId", async (request, response) => {
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
    if (!usingDb) {
        console.log("Couldn't save - not using database");
        response.status(404).json({ success: false, error: "Not using database" });
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
    if (!usingDb) {
        console.log("Couldn't get leaderboards - not using database");
        return response.status(400).json({ success: false, error: "Not using database" });
    }

    let leaderboards = await getLeaderboards();

    if (leaderboards.length == 0) {
        response.status(204).json({ success: true, leaderboards });

    } else {
        response.status(200).json({ success: true, leaderboards });
    }
});

app.get("/api/leaderboards/:trackId", async (request, response) => {
    if (!usingDb) {
        console.log("Couldn't get leaderboard - not using database");
        return response.status(400).json({ success: false, error: "Not using database" });
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
    if (!usingDb) {
        console.log("Couldn't update leaderboard - not using database");
        return response.status(400).json({ success: false, error: "Not using database" });
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
        response.status(400).json({ success: false, error });
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
        response.status(400).json({ success: false, error });
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
        let lobbies = getLobbies();
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

        let lobby = await getOnlineLobbyById(lobbyId);

        // non-existing lobby
        if (lobby) {
            return response.render("lobby", { title: "Lobby (Online)", lobby });
        
        } else {
            lobby = await getOfflineLobbyById(lobbyId);

            if (lobby) {
                return response.render("lobby", { title: "Lobby (Offline)", lobby });   
            }
        }

        response.redirect("/lobbies");
    
    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error: `There was a server error: ${error}` });
    }
});


app.get("/race/:raceId", async (request, response) => {
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
    response.render("error-404", { title: "404 Not Found" });
});