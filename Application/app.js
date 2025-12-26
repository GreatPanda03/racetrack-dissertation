// * source: Net Ninja, (Jun 23, 2020). "Node.js Crash Course Tutorial #8 - Middleware", [Online Video]. Available at: https://www.youtube.com/watch?v=_GJKAs7A0_4. Accessed: Dec. 18, 2025.


// [[ Imports ]] //
const express = require("express");
const { version } = require("./package.json");
const { gameTracks } = require("./track-repository");


// [[ App Set Up ]] //
const app = express();
app.set("view engine", "ejs");
app.listen(3000); 
app.use(express.static("public"));



// [[ URL Endpoints ]] //

// environment variables
app.use((request, response, next) => {
    response.locals.version = version;
    next();
})

// available pages
app.get("/", (request, response) => {
    response.render("home", { title: "Home" });
});

app.get("/tracks/build", (request, response) => {
    response.render("track-builder", { title: "Track Builder" });
});

app.get("/tracks/list", (request, response) => {
    response.render("tracks-list", { title: "Tracks List", gameTracks });
});

app.get("/tracks/play/:trackId", (request, response) => {
    let trackId = request.params.trackId;
    let track = gameTracks.find(t => JSON.parse(t).trackId == trackId);
    
    response.render("track-play", { title: "Racing", track })
})

app.get("/settings", (request, response) => {
    response.render("settings", { title: "Settings" } );
});

// missing page (404)
app.use((request, response) => {
    response.render("error-404", { title: "404 Not Found" });
});