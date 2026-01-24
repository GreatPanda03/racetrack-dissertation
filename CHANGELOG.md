## Changelog

The changelog covers development progress for the project, ["The Racetrack Game"](https://campus.cs.le.ac.uk/teaching/proposals/v24167.the_racetrack_game), including a list of features and fixes over versions.

For writing and research progress, please see the [project log](./PROJECTLOG.md).

All dates are in the form <code>YYYY/MM/DD</code>.

Versions are in the form <code>X.Y.Z</code>: 
<code>X</code> represents a significant version encompassing a range of unique functionalities; 
<code>Y</code> represents single feature or set of related additions;
and <code>Z</code> represents fixes, or build-ups to the same feature as a gradual release.

---

### Version: 1.4.0
**Date:** 2026/01/24
<details>
<summary>Track Gameplay - Track Saving & Listing</summary>

**Additions / Changes:**
1. Made some track builder options functional
    * **Track Details:** edit the current track's details
    * **Save:** save the current track
    * **Export:** displays the JSON data of the track to share
2. Reworked the Tracks List page
    * Tracks are divided into three sections: "Game Tracks", "Player Tracks", and "Personal Tracks"
    * Tracks are displayed as a list with a preview and title
    * Selecting a track displays all the track's details, including its preview
    * Personal tracks have the option to be edited further or deleted
3. Re-added Track Builder button labels, and a "Compact Mode" option to hide these labels (enabled by default)
* **NOTE:** notifications / toasts will be added later!

**Bugs Fixed:**
1. (DEV) Fixed "toJson" object methods using the wrong argument type for pretty-printing (oops...)

**Bugs Discovered:**
<br>No additional bugs discovered.

</details>

---

### Version: 1.3.0
**Date:** 2026/01/19
<details>
<summary>Track Building - Cleanup Pit Stop</summary>

**Additions / Changes:**
1. Made the track builder "Import" option functional - provide valid Track JSON to reconstruct the track
2. Amended units typo for race results showing velocity as "ms⁻²" instead of "m/s" (oops...)
3. (DEV) Code cleanup (lots of repeated code from 1.1.0 & 1.2.0)
    * DRY'd & organised track renderer drawing methods, race instance material application, and track builder polygon-related code
    * Made basal track renderer drawing methods public (to make gameplay code concise)
    * Amended references to missing attributes that didn't throw errors
    * Created a new CanvasRenderer class: TrackRenderer now extends this class instead of TrackForm, and now has a TrackForm object

**Bugs Fixed:**
1. Amended gravel slowing race cars down to a complete stop (if at 0 m/s, acts like Curb)

**Bugs Discovered:**
1. Aware that flipping an unlooped track causes the nodes to shift 1 node more than required

</details>

---

### Version: 1.2.0
**Date:** 2026/01/17
<details>
<summary>Track Building - Obstacles & Decorations</summary>

**Additions / Changes:**
1. Implemented "Obstacles" for the track builder
    * Obstacles are generic polygons which cause players to crash when driven into
    * Points can be added to a obstacle to define its shape
    * Select a point and drag to move it around
    * The entire obstacle, or points within it, can be removed
2. Implemented "Obstacles" for gameplay
    * Driving into an obstacle causes players to
3. Implemented "Decorations" for the track builder
    * Decorations are generic polygons which are purely ornamental with no effect
    * Points can be added to a decoration to define its shape
    * Select a point and drag to move it around
    * The entire decoration, or points within it, can be removed
4. Implemented "Decorations" for gameplay
    * Simply act as visuals
5. New tracks: "The Slalom" and "Just Floor It"
* **NOTE:** Obstacles appear above Materials, and Materials appear above Decorations

**Bugs Fixed:**
<br>No existing bugs fixed.

**Bugs Discovered:**
1. Aware of rendering issue at the end of the final node for 2-node unlooped tracks

</details>

---

### Version: 1.1.0
**Date:** 2026/01/17
<details>
<summary>Track Building - Materials</summary>

**Additions / Changes:**
1. Adjusted node details when selecting a node
    * Added options to insert a node before / after a selected node
    * Slightly adjusted the look of the UI
2. Adjusted building controls
    * Changed the icon of materials from "Cube" to "Droplet"
    * Flipping a track's direction no longer flips checkpoints and widths too
    * Selecting a track element no longer slightly shifts it to align with the mouse
    * Node-related coordinates (of any kind) are now rounded to the nearest integer (less memory takeup + uses pixels anyway)
3. Adjusted track rendering
    * Hiding the track now hides checkpoints and the directional dot
    * Tracks now have an outline to see through materials - must still stay within the track itself
3. Implemented "Materials" for the track builder
    * The current materials are: "Gravel"; "Curb"; "Water"; and "Booster"
    * Materials are made up of a collection of points
    * Points can be added to a material to define its shape
    * Select a point and drag to move it around
    * Each material has its own appearance & effect
    * The entire material, or points within it, can be removed
4. Implemented "Materials" for gameplay
    * Driving over a material affects the race car's subsequent possible moves
5. Small info changes to gameplay screen
    * Gameplay area now displays "Welcome to (track name)!"
    * Added a note about materials
6. New tracks: "The Canal" and "A Bumpy Ride"

**Bugs Fixed:**
1. Fixed deleted node details still showing after deletion

**Bugs Discovered:**
1. Aware that SplineUtil unit tests fail due to Vector2 rounding for nodes (< 0.1 inaccuracy in all cases, so not a big issue)

</details>

---

### Version: 1.0.0
**Date:** 2026/01/14
<details>
<summary>Transition to V1</summary>

**Additions / Changes:**
1. Expanded and adjusted the track builder's options
    * Adjusted the layout of the options into smaller lists with tooltips
    * Separated "Track Visual" options from "Track Manipulation" options
    * Added a "Select" option to distinctly select track elements
    * Added a "Flip" option to reverse the direction of the track
    * Added a "Centre" option to centre the entire track on the canvas
2. Amended track builder typos
3. Nodes can now be removed from tracks being built
4. Added "Materials" to the track builder (non-placeable, non-functional)
    * The current materials are: "Gravel"; "Curb"; "Water"; and "Booster"
    * Materials are planned to be implemented in v1.1.0
5. Slightly adjusted the track "The Spiral" (better centring)
6. Added a new track, "Downhill"
7. (DEV) File organisation
    * Classes / tests grouped into categories
    * Core code moved to `src/core` folder
    * Barrel file under `src/core` for test imports

**Bugs Fixed:**
1. Fixed "left" and "right" of track being visually opposite ("left" was technically drawn on the right)
2. Tracks are now drawn as a whole polygon rather than with triangle segments (resolves thin visual gaps in the track)
3. Final node of unlooped tracks has a locked checkpoint value (forced to be `true`)

**Bugs Discovered:**
1. Aware that builder button tooltips persist after selection until clicking elsewhere

</details>

---

### Version: 0.6.0
**Date:** 2026/01/07
<details>
<summary>Looped Tracks & V0 Cleanup</summary>

**Additions / Changes:**
1. (DEV) Significant class rework to expose methods for unit testing (and separate functionality from UI)
2. (DEV) Introduced tests to cover most Version 0 features
3. Added "Loop" option in Track Builder to toggle whether the track is looped
4. Added a new open-ended track, "The Spiral"
5. Added win and crash logic for looped tracks

**Bugs Fixed:**
1. Amended misaligned node numbers for double-digit figures
2. Amended "unlooped" tracks not working or rendering at all
3. Amended crashing for spots close to but within track limits

**Bugs Discovered:**
1. Aware that race cars can start behind starting lines for unlooped tracks which makes them unplayable due to instant crashing (not an issue for existing tracks yet)
2. Aware that race car's dont crash/finish at the track boundary/finish line (linked to longer race time when crossing the finish line)

</details>

---

### Version: 0.5.0
**Date:** 2025/12/27
<details>
<summary>Basic Track Racing (Part 2)</summary>
<br>

**Additions / Changes:**
1. Added an option to set a node's "width", defining the thickness of the track around it
2. Added an option to set nodes as checkpoints, indicated by a coloured strip
3. The first node of a track is the starting line by default, indicated by a black strip
4. Added "shift nodes anti-clockwise / clockwise" buttons to swap nodes around for convenience (like a conveyor belt)
5. Added a dot visual to indicate the track direction (Node 1 -> Node 2)
6. Added a line visual to track race car movement around racetracks
7. Added collisions: driving off a track causes the race car to crash
8. Added checkpoint and finish line conditions: race cars must cross all checkpoints in order and end with the finish line
9. Added a popup to display the results of a finished race ("total moves", "distance", "time", "average speed", and "top speed")

**Bugs Fixed:**
<br>No existing bugs fixed.

**Bugs Discovered:**
1. (FIXED 0.6.0) Aware that crashes sometimes happen when very close to the track edge
2. Final time should end sooner when making the final move across the finish line

</details>

---

### Version: 0.4.0
**Date:** 2025/12/26
<details>
<summary>Basic Track Racing (Part 1)</summary>
<br>

**Additions / Changes:**
1. Tracks can be exported as JSON with the "Export" option (displayed in console, not directly user-facing)
2. Added a basic tracks called "The Oval"
3. Implemented a basic "Tracks List" to display available tracks
4. Implemented a gameplay screen to start and play tracks
5. Tracks now include grid lines and can be raced around with vectors, with velocity options indicated by circles around the race car

**Note:** win conditions, crashing, and results will be included in v0.5.0

**Bugs Fixed:**
1. Amended missing styling for 404 page

**Bugs Discovered:**
1. (FIXED 0.6.0) Aware of node number misalignment for double-digit figures (and higher)

</details>


---

### Version: 0.3.0
**Date:** 2025/12/22
<details>
<summary>Splines & Track Visuals</summary>
<br>

**Additions / Changes:**
1. Implemented splines
2. Tracks are now drawn using splines with a width for each node
3. Track visuals (nodes, edges, path) can be toggled

**Bugs Fixed:**
<br>No existing bugs fixed.

**Bugs Discovered:**
1. (FIXED 1.0.0) Aware of small gaps between path triangles

</details>

---

### Version: 0.2.0
**Date:** 2025/12/20
<details>
<summary>Node Placement & File Changes</summary>
<br>

**Additions / Changes:**
1. Set up basic Track Builder functionality (classes, buttons, etc.)
2. (DEV) Reworked code for EJS partials (no longer in fixed "head", "nav", "footer" tags)
3. Implemented the ability to place nodes on the canvas
    * Select "Path" and click the canvas to place a new node
    * Nodes are numbered according to their placement order
    * Adjust nodes by selecting them and moving the mouse
    * A straight line is drawn between each node
4. Replaced Bootstrap icons with Lucide icons (higher variety)
5. Added <code>.gitignore</code> file (to lower commit / deployment size)

**Bugs Fixed:**
1. Track Builder button icons now appear (replaced with Lucide, didn't show with Bootstrap)

**Bugs Discovered:**
1. (FIXED 0.6.0) Aware of the "looped" option not working (causes tracks to disappear entirely when disabled)
</details>

---

### Version: 0.1.0
**Date:** 2025/12/19
<details>
<summary>App Basis - Node.js & HTML</summary>
<br>

**Additions / Changes:**
1. (DEV) Replaced existing application files with a new version which uses Node.js and HTML (as opposed to pure JavaScript) to prepare for client-server operations.

**Bugs / Fixes:**
<br>No existing bugs fixed.
</details>

---