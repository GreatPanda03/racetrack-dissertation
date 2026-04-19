// * source: Net Ninja, (Jun 23, 2020). "Node.js Crash Course Tutorial #8 - Middleware", [Online Video]. Available at: https://www.youtube.com/watch?v=_GJKAs7A0_4. Accessed: Dec. 18, 2025.


// [[ Imports ]] //
const express = require("express");
const { version } = require("./package.json");

const mongoose = require("mongoose");
const TrackModel = require("./models/track");
const LeaderboardModel = require("./models/leaderboard");

const { gameTracks } = require("./src/track-repository");
const LOBBY_LOCALITY = require("./src/core/enums/lobby-locality").default;
const RACER_TYPE = require("./src/core/enums/racer-type").default;

const { db } = require("./services/firebase-admin");

let offlineLobbies = [];
let offlineRaces = [];



// [[ App Set Up ]] //
const app = express();
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.static("public")); // static resources
app.use("/core", express.static("src/core")); // core classes etc.

// database
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



// [[ URL Endpoints ]] //

// environment variables
app.use((request, response, next) => {
    response.locals.version = version;
    next();
});


// available pages
app.get("/", (request, response) => {
    response.render("home", { title: "Home" });
});


app.get("/tracks/build", (request, response) => {
    response.render("track-builder", { title: "Track Builder", trackToLoad: null });
});


app.get("/tracks/build/:trackId", async (request, response) => {
    if (usingDb) {
        try {
            let trackToLoad = await TrackModel.findById( request.params.trackId );

            if (trackToLoad) {
                let author = trackToLoad.author;
                
                if (author == "" || author == "Game") {
                    response.redirect("/tracks/list");
                    return;
                }

                response.render("track-builder", { title: "Track Builder", trackToLoad });

            } else {
                response.redirect("/tracks/build");
            } 
        } catch(error) {
            console.log(`[Track Builder] Couldn't load track: "${error}"`);
            response.redirect("/tracks/list");
        }
    
    } else {
        let trackToLoad = gameTracks.find(t => JSON.parse(t)._id == request.params.trackId );

        if (trackToLoad) {
            let author = trackToLoad.author;
            
            if (author == "" || author == "Game") {
                response.redirect("/tracks/list");
                return;
            }

            response.render("track-builder", { title: "Track Builder", trackToLoad });
        }
    }
});


app.get("/tracks/list", async (request, response) => {
    if (usingDb) {
        try {
            let trackData = await TrackModel.find();
            let tracks = trackData.map(d => JSON.stringify(d));

            let leaderboardData = await LeaderboardModel.find();
            let leaderboards = leaderboardData.map(d => JSON.stringify(d));

            response.render("tracks-list", {
                title: "Tracks List", tracks, leaderboards });
        
        } catch(error) {
            console.log(`[Tracks List] Listing failed: "${error}"`);
            response.status(500).json({ success: false, error });
        }

    } else {
        response.render("tracks-list", { 
            title: "Tracks List", tracks: gameTracks, leaderboards: [] });
    }
});


app.get("/lobbies/list", async(request, response) => {
    try {
        response.render("game-lobbies", {title: "Lobbies" });

    } catch (error) {
        console.error(error);
        response.status(500).send({ success: false, error: "Failed to load lobbies" });
    }
});


app.get("/lobbies", async(request, response) => {
    try {
        let snapshot = await db.ref("lobbies").once("value");
        let lobbiesObj = snapshot.val() || {};

        let lobbies = Object.entries(lobbiesObj).map(([id, lobby]) => ({
            id, ...lobby}));

        response.status(200).json({ success: true, lobbies});
    
    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});


app.post("/lobbies", async(request, response) => {
    try {
        let { playerId, trackId, locality } = request.body;

        if (!trackId || !locality) {
            return response.status(400).json({ success: false, error: "Missing data" });
        }

        let track = await TrackModel.findById(trackId);
        if (!track) {
            return response.status(404).json({ success: false, error: "Track not found" });
        }

        let host = {id: playerId, playerType: RACER_TYPE.Player}
        let lobbyId = "";

        if (locality == LOBBY_LOCALITY.Online) {
            let lobbyRef = db.ref("lobbies").push();
            lobbyId = lobbyRef.key; // lobbyRef itself is the ID
            let lobby = { hostId: playerId, trackId, locality, 
                players: {[playerId]: host} };

            await lobbyRef.set( lobby );

        } else {
            lobbyId = "offline";
            let lobby = { id: "offline", hostId: playerId, trackId, locality, players: {host} };
            offlineLobbies.push(lobby);
        }

        response.status(200).json({ success: true, lobbyId });
    
    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});


app.get("/lobbies/:lobbyId", async (request, response) => {
    try {
        let lobbyId = request.params.lobbyId;

        if (!lobbyId) {
            response.status(400).json({ success: false, error: "Lobby ID missing" });
        }
    
        let snapshot = await db.ref(`lobbies/${lobbyId}`).once("value");
        let lobby = snapshot.val();

        if (lobby) {
            response.render("lobby-online", { title: "Lobby (Online)", lobby });
            
        } else {
            lobby = offlineLobbies.find(l => l.id == lobbyId);

            if (lobby) {
                    response.render("lobby-offline", { title: "Lobby (Offline)", lobby });

            } else {
                response.redirect("/tracks/list");
            }
        }

    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});


app.post("/lobbies/join/:lobbyId", async (request, response) => {
    try {
        let lobbyId = request.params.lobbyId;
        
        let snapshot = await db.ref(`lobbies/${lobbyId}`).once("value");
        let lobby = snapshot.val();

        if (lobby) {
            console.log(`Joining Lobby ${lobbyId}`);
            response.render("lobby-online", { title: "Lobby (Online)", lobby });

        } else {
            response.status(404).json({ success: false, error: "Lobby doesn't exist" });
        }

    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});


app.post("/lobbies/:lobbyId", async (request, response) => {
    try {
        let lobbyId = request.params.lobbyId;
        let { details } = request.body;

        if (!offlineLobbies.find(l => l.id == lobbyId)) {
            await db.ref(`lobbies/${lobbyId}`).update({
                racers: details.racers
            });
        }

        response.status(200).json({ success: false });

    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});


app.post("/lobby/start", async (request, response) => {
    try {
        let { lobbyId, playerId } = request.body;
        let snapshot = await db.ref(`lobbies/${lobbyId}`).once("value");
        let lobby = snapshot.val();

        if (lobby) {
            if (playerId == lobby.hostId) {
                let raceRef = db.ref(`races/${lobbyId}`);
                let race = {...lobby};
                await raceRef.set(race);
                await db.ref(`lobbies/${lobbyId}`).remove();
            
            } else {
                return response.status(403).json({ success: false, error: "Only the host can start the race" });
            }

        } else {
            let index = offlineLobbies.findIndex(l => l.id == lobbyId);

            if (index > -1) {
                lobby = offlineLobbies[index];
                offlineLobbies.splice(index, 1);
                offlineRaces.push(lobby);

            } else {
                return response.status(404).json({ success: false, error: "Lobby not found" });
            }
        }
        
        response.status(200).json({ success: true, raceId: lobbyId });

        /*
        let lobbyId = request.params.lobbyId;
        let index = lobbies.findIndex(l => l.id == lobbyId);
        let lobby = lobbies[index];
        lobbies.splice(index, 1);
        
        let raceId = findNextId(races);
        lobby.id = raceId;
        races.push(lobby);
        */

    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, error });
    }
});


app.get("/tracks/:trackId", async (request, response) => {
    if (usingDb) {
        try {
            let trackId = request.params.trackId;

            if (!trackId) {
                response.status(400).json({ success: false, error: "Missing data" });
            }

            let track = await TrackModel.findById( trackId );

            if (!track) {
                response.status(404).json({ success: false, error: "No track with the given ID" });
            }

            response.status(200).json({ success: true, track });
        
        } catch (error) {
            console.log(error);
            response.status(500).json({ success: false, error: error})
        }
    }
})


app.get("/tracks/play/:raceId", async (request, response) => {
    if (usingDb) {
        try {
            let raceId = request.params.raceId;
            
            let snapshot = await db.ref(`races/${raceId}`).once("value");
            let race = snapshot.val();

            if (race) {
                let track = await TrackModel.findById( race.trackId );

                if (track) {
                    response.render("track-play", { title: "Race", track, race });
                
                } else {
                    response.redirect("/tracks/list");
                }

            } else {
                race = offlineRaces.find(r => r.id == raceId);

                if (race) {
                    let track = await TrackModel.findById( race.trackId );

                    if (track) {
                        response.render("track-play", { title: "Race", track, race });
                    
                    } else {
                        response.redirect("/tracks/list");
                    }
   
                } else {
                    response.redirect("/tracks/list");
                }
            }

        } catch(error) {
            console.log(`[Gameplay] Loading failed: "${error}"`);
            response.status(500).json({ success: false, error });
        }

    } else {
        let trackId = request.params.trackId;
        let lobby = request.query.lobby;

        if (!trackId || !lobby) {
            response.status(400).json({ success: false, error: "Track ID / lobby data missing" });
        }

        let trackJson = gameTracks.find(t => JSON.parse(t)._id == trackId );
        let track = JSON.parse(trackJson);
        lobby = JSON.parse(decodeURIComponent(lobby));
        
        if (track && lobby) {
            response.render("track-play", { title: "Race", track, lobby });   
        } else {
            response.redirect("/tracks/list");
        }
    }
});


app.post("/tracks/save", async (request, response) => {
    if (usingDb) {
        try {
            let track = request.body;

            if (!track) {
                throw new Error(`[Track Builder] Track save failed: no track data provided`);
            }

            if (track._id) {
                await TrackModel.findByIdAndUpdate(
                    track._id, { "$set": track });
                
            } else {
                await new TrackModel(track).save(); // generate OID
            }

            response.status(200).json({ success: true });

        } catch(error) {
            console.log(`[Track Builder] Track save failed: "${error}"`);
            response.status(400).json({ success: false, error });
        }

    } else {
        console.log("[Track Builder] Couldn't save - not using database");
        response.status(404).json({ success: false, error: "Not using database" });
    }
});


app.get("/tracks/delete/:trackId", async (request, response) => {
    try {
        let track = await TrackModel.findById( request.params.trackId );
        let author = track.author;

        if (author == "" || author == "Game") {
            response.redirect("/tracks/list");
            return;
        }

        await TrackModel.findByIdAndDelete( request.params.trackId );
        
        response.redirect("/tracks/list");
    
    } catch(error) {
        console.log(`[Tracks List] Deletion failed: "${error}"`);
    }
});


app.get("/tracks/leaderboards", async(request, response) => {
    if (usingDb) {
        // TODO: ...
    }
});


app.get("/tracks/leaderboards/:trackId", async(request, response) => {
    if (usingDb) {
        try {
            let trackId = request.params.trackId;

            if (!trackId) {
                return response.status(400).json({ success: false, error: "Missing data" });
            }

            let leaderboardData = await LeaderboardModel.findById(trackId);
            let leaderboard = JSON.stringify(leaderboardData);

            response.status(200).json({ success: true, leaderboard });
        
        } catch (error) {
            console.log(error)
            response.status(500).json({ success: false, error });
        }
    }
})


app.post("/tracks/leaderboards", async (request, response) => {
    if (!usingDb) return;

    try {
        let { trackId, time, carType, moves } = request.body;

        if (!trackId || !time || !moves) {
            throw new Error("Missing trackId, time, or moves");
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
        console.log(`[Leaderboards] Failed to save: ${error}`);
        response.status(400).json({ success: false, error });
    }
});


app.get("/settings", (request, response) => {
    response.render("settings", { title: "Settings" } );
});


// missing page (404)
app.use((request, response) => {
    response.render("error-404", { title: "404 Not Found" });
});