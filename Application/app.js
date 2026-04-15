// * source: Net Ninja, (Jun 23, 2020). "Node.js Crash Course Tutorial #8 - Middleware", [Online Video]. Available at: https://www.youtube.com/watch?v=_GJKAs7A0_4. Accessed: Dec. 18, 2025.


// [[ Imports ]] //
const express = require("express");
const { version } = require("./package.json");

const mongoose = require("mongoose");
const TrackModel = require("./models/track");
const LeaderboardModel = require("./models/leaderboard");

const { gameTracks } = require("./src/track-repository");


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


/* // NOTE: uncomment when using actual lobbies
app.post("/tracks/play", async(request, response) => {
    let { trackId, racers } = request.body;

    if (!trackId || !racers) {
        return res.status(400).json({ success: false });
    }

    let racersJson = JSON.stringify(racers);
    let racersEncoded = encodeURIComponent(racersJson);

    response.redirect(`/tracks/play/${trackId}?racers=${racersEncoded}`);
});
*/


app.get("/tracks/play/:trackId", async (request, response) => {
    if (usingDb) {
        try {
            let trackId = request.params.trackId;
            let lobby = request.query.lobby;

            if (!trackId || !lobby) {
                response.status(400).json({ success: false, error: "Track ID / lobby data missing" });
            }

            let track = await TrackModel.findById( trackId );
            lobby = JSON.parse(decodeURIComponent(lobby));

            if (track && lobby) {
                response.render("track-play", { title: "Race", track, lobby });
            } else {
                response.redirect("/tracks/list");
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
        // TODO: ...
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