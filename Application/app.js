// * source: Net Ninja, (Jun 23, 2020). "Node.js Crash Course Tutorial #8 - Middleware", [Online Video]. Available at: https://www.youtube.com/watch?v=_GJKAs7A0_4. Accessed: Dec. 18, 2025.


// [[ Imports ]] //
const express = require("express");
const { version } = require("./package.json");

const mongoose = require("mongoose");
const TrackModel = require("./models/track");



// [[ App Set Up ]] //
const app = express();
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.static("public")); // static resources
app.use("/core", express.static("src/core")); // core classes etc.

const uri = "mongodb+srv://admin:bIL1eC1QX8D5RLvR@testcluster.r5ggsoh.mongodb.net/?appName=TestCluster";
mongoose.connect(uri)
    .then((result) => app.listen(3000))
    .catch((error) => {
        console.log(error);
        console.log("[CONNECTING WITHOUT DATABASE!]");
        app.listen(3000);
    });

/*
app.listen(3000);
console.log("RUNNING WITHOUT DATABASE!");
*/


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
});


app.get("/tracks/list", async (request, response) => {
    try {
        let data = await TrackModel.find();
        let tracks = data.map(d => JSON.stringify(d));
        response.render("tracks-list", { title: "Tracks List", tracks });
    
    } catch(error) {
        console.log(`[Tracks List] Listing failed: "${error}"`);
        response.status(500).json({ success: false, error });
    }
});


app.get("/tracks/play/:trackId/:racecarId", async (request, response) => {
    try {
        let trackId = request.params.trackId;
        let racecarId = request.params.racecarId;

        if ( !(trackId && racecarId) ) {
            response.status(400).json({ success: false, error: "Track / race car ID missing" });
        }

        let track = await TrackModel.findById( trackId );

        if (track) {
            response.render("track-play", { title: "Race", track, racecarId });   
        } else {
            response.redirect("/tracks/list");
        }

    } catch(error) {
        console.log(`[Gameplay] Loading failed: "${error}"`);
        response.status(500).json({ success: false, error });
    }
});


app.post("/tracks/save", async (request, response) => {
    try {
        let track = request.body;

        if (!track) {
            throw new Error(`[Track Builder] Track save failed: no track data provided`);
        }

        if (track._id) {
            await TrackModel.findByIdAndUpdate(
                track._id, { "$set": track }, { returnDocument: "after" });
            
        } else {
            await new TrackModel(track).save();
        }

        response.status(200).json({ success: true });

    } catch(error) {
        console.log(`[Track Builder] Track save failed: "${error}"`);
        response.status(400).json({ success: false, error });
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


app.get("/settings", (request, response) => {
    response.render("settings", { title: "Settings" } );
});


// missing page (404)
app.use((request, response) => {
    response.render("error-404", { title: "404 Not Found" });
});