## Changelog

The changelog covers development progress for the project, ["The Racetrack Game"](https://campus.cs.le.ac.uk/teaching/proposals/v24167.the_racetrack_game), including a list of features and fixes over versions.

For writing and research progress, please see the [project log](./PROJECTLOG.md).

All dates are in the form <code>YYYY/MM/DD</code>.

Versions are in the form <code>X.Y.Z</code>: 
<code>X</code> represents a significant version encompassing a range of unique functionalities; 
<code>Y</code> represents single feature or set of related additions;
and <code>Z</code> represents fixes, or build-ups to the same feature as a gradual release.

---

### Version: 2.0.0
**Date:** 2026/03/13
<details>
<summary>V2 Transition & Local Multiplayer</summary>

**Additions / Changes:**
1. Implemented local multiplayer - race offline with more than just you!
    * **How it works:** each player starts at the same spot and takes turns to choose their move - once everyone's chosen one, everyone moves simultaneously
2. Implemented basic Robot Racers - no friends? No problem!
    * **How it works:** robots are exactly like players, but take moves on their own accord - they plan ahead to find a good one, but can sometimes make mistakes
3. Adjusted race details & options
    * Added an option to select how many players to race with locally
    * Added options to provide a name, colour, race car type per local player
    * Added an option to play with Robot racers (currently no explicit difficulty options)
4. Adjusted live race stats
    * Separated live race stats by race car (collapsible tabs)
    * Added race car details per player
    * Simplified checkpoint UI to simpler checkboxes (rather than text)
    * Added the finish line as an indicator to checkpoints
    * Added crash count as a race stat
5. Adjusted race results
    * Race results display the results of all players as a table with sorting options
6. Adjusted race track rendering
    * Changed directional dot to be an arrow
    * Race cars are now numbered and coloured according to local players

* **Note:** will add retiring specific players in the next version

**Bugs Fixed:**
<br>No existing bugs fixed.

**Bugs Discovered:**
1. Aware that Robot moves can make the game "freeze" a little (especially when retiring) due to calculations
2. Aware that adding racers between removals causes repeated colours (UX issue)
3. Aware that player numbers in race results don't always match up with their real numbers
4. Aware that final race time represents the <i>total time of the distance driven</i> (rather than <i>total elapsed time</i>)
5. Aware that some UI content (namely in popups) still overflows when the window is too small

</details>

---

### Version: 1.8.0
**Date:** 2026/02/15
<details>
<summary>V1 - Cleanup - More Testing (Part 2)</summary>

**Additions / Changes:**
1. (DEV) Expanded test suite for V1 features
2. Added a fallback to use the track repository when unable to connect to DB (for at least some playability)
    * NOTE: all data-related features won't work in this state!
3. Adjusted how Gravel works (now only allows moves **<** current speed, from being **<=** current speed)

**Bugs Fixed:**
1. Fixed Curb not supplying the correct moves (used MaxAcceleration.x, which is typically negative, for <= comparison)
2. Fixed being "locked out" of making moves when all available ones are off screen (now autoplays the move if that happens)

**Bugs Discovered:**
1. Aware that some `MATERIAL_INFO` tests aren't working (this is a test setup issue, the functionality works in practice)

</details>

---

### Version: 1.7.0
**Date:** 2026/02/10
<details>
<summary>V1 Cleanup - Testing & Bug Fixes (Part 1)</summary>

**Additions / Changes:**
1. (DEV) Mass unit testing of all V1 features to prepare for V2!
2. Added Save confirmation when leaving the track builder with unsaved changes
3. Added toasts for clearer Save / Apply confirmations
4. Added a grid visual toggle to the track builder
5. Limited node-related position rounding to JSON conversion
    * So that JSON numbers aren't using unnecessary decimals, but also not to interfere with established (and otherwise correct) unit tests...
6. Added a new track, "The Spotted Starfish"
7. Moves which cause crashes are now shown as part of a race car's path
8. (DEV) Other development overhauls:
    * Reworked line intersection calculation (now returns intersection point)
    * Officially introduced Validator class into validation
    * Vector2 getters now use `get` syntax (use `vector.x` & `vector.y` instead of `vector.x()` & `vector.y()`)
    * Added Line class for better line definition and replaced line-like structured with it
    * Consolidated `TrackBoundaries` into `TrackForm`, which now stores `nodeSpans` and `boundaries` (no more `leftSide` and `rightSide`)
    * Adjusted checkpoint checks to be `O(n)` rather than `O(n^2)` (only need to check previous node)
    * Grid spacing can now be defined for races (changed to 10px by default from 25px, not yet user facing)

**Bugs Fixed:**
1. Fixed final time to account for the exact moment a finish or crash is made
2. Fixed race cars to start from a safe space for unlooped tracks (race cars now start right before the directional dot on unlooped tracks)
3. Fixed tooltips persisting after selecting buttons in the track builder
4. Fixed excess drawing artefacts at the end of unlooped tracks of certain lengths (misdiagnosed as occurring for 2-node-long tracks)
5. Fixed flipping unlooped tracks causing nodes to shift one more node along than expected
6. Fixed live race stats panel overlapping the canvas when the screen is too narrow (now absolutely positioned beside canvas, bandaid...)
7. Fixed option to restart showing when completing the race (no longer shows)
8. Fixed details of final node not updating when making track looped again if it's selected

**NOTE:** Aware that some test cases don't work and that many aren't yet covered, and that edge cases are missing - WIP!!!
</details>

---

### Version: 1.6.0
**Date:** 2026/02/01
<details>
<summary>Track Building - Extended Features</summary>

**Additions / Changes:**
1. Implemented the ability to undo / redo track building actions
    * Currently only applicable to node & point placement, movement, and deletion (not detail changes)
2. Implemented the option to play test a track while building it
3. Implemented the option to save a track as a new copy
    * Tracks are saved as "`[track_name] Copy`"
4. Adjusted track builder toolbox
    * Re-added the canvas pan tool button (non-functional)
    * Changed material droplet icons to match the respective material colour
    * Swapped columns of build and manipulation options
5. Recentring the track now accounts for polygons 
6. (DEV) Re-organised track builder code

**Bugs Fixed:**
<br>No existing bugs fixed.

**Bugs Discovered:**
<br>No additional bugs discovered.

</details>


---

### Version: 1.5.0
**Date:** 2026/01/28
<details>
<summary>Track Gameplay - Live Race Stats & Race Car Types</summary>

**Additions / Changes:**
1. Added a display for race car details during a race
    * Current velocity, max acceleration, max velocity
2. Added a display for live race stats during a race
    * Time passed, distance travelled, top speed, average speed, checkpoints passed
3. Added a set of race cars to choose from for a race
    * There are 3 new race car types: The Race Car; The Motorbike; and The Truck
    * Each race car (currently) has a max velocity and acceleration, so choose wisely!
    * Select a track from the list of available tracks, then choose a race car to race with
4. Added an option to restart at rest from the last location before crashing
5. Added an option to search for tracks by name in the tracks list
6. Renamed "A Bumpy Ride" to "The Striped Oval"

**Bugs Fixed:**
<br>No existing bugs fixed.

**Bugs Discovered:**
1. Aware that some UI elements "spill over" when the screen is too narrow, namely:
    * Tracks List track details popup
    * (FIXED v1.7.0) Live race stats panel

</details>

---

### Version: 1.4.0
**Date:** 2026/01/24
<details>
<summary>Track Management - Track Saving & Listing</summary>

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
1. (FIXED v1.8.0) Aware that moves appear entirely off track when race cars are near the edge at high speed

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
1. (FIXED 1.7.0) Aware that flipping an unlooped track causes the nodes to shift 1 node more than required

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
1. (FIXED 1.7.0) Aware of rendering issue at the end of the final node for 2-node unlooped tracks

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
1. (FIXED v1.7.0) Aware that SplineUtil unit tests fail due to Vector2 rounding for nodes (< 0.1 inaccuracy in all cases, so not a big issue)

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
1. (FIXED 1.7.0) Aware that builder button tooltips persist after selection until clicking elsewhere

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
1. (FIXED 1.7.0) Aware that race cars can start behind starting lines for unlooped tracks which makes them unplayable due to instant crashing (not an issue for existing tracks yet)
2. (FIXED 1.7.0) Aware that race car's dont crash/finish at the track boundary/finish line (linked to longer race time when crossing the finish line)

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
2. (FIXED 1.7.0) Final time should end sooner when making the final move across the finish line

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