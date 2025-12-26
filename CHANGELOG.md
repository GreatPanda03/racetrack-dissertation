## Changelog

The changelog covers development progress for the project, ["The Racetrack Game"](https://campus.cs.le.ac.uk/teaching/proposals/v24167.the_racetrack_game), including a list of features and fixes over versions.

For writing and research progress, please see the [project log](./PROJECTLOG.md).

All dates are in the form <code>YYYY/MM/DD</code>.

Versions are in the form <code>X.Y.Z</code>: 
<code>X</code> represents a significant version encompassing a range of unique functionalities; 
<code>Y</code> represents single feature or set of related additions;
and <code>Z</code> represents fixes, or build-ups to the same feature as a gradual release.

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

**Bugs / Fixes:**
1. Amended missing styling for 404 page

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

**Bugs / Fixes:**
<br>No bugs found yet.

</details>

---

### Version: 0.2.0
**Date:** 2025/12/20
<details>
<summary>Node Placement & File Changes</summary>
<br>

**Additions / Changes:**
1. Set up basic Track Builder functionality (classes, buttons, etc.)
2. Reworked code for EJS partials (no longer in fixed "head", "nav", "footer" tags)
3. Implemented the ability to place nodes on the canvas
    * Select "Path" and click the canvas to place a new node
    * Nodes are numbered according to their placement order
    * Adjust nodes by selecting them and moving the mouse
    * A straight line is drawn between each node
4. Replaced Bootstrap icons with Lucide icons (higher variety)
5. Added <code>.gitignore</code> file (to lower commit / deployment size)

**Bugs / Fixes:**
1. Track Builder button icons now appear (replaced with Lucide, didn't show with Bootstrap)
</details>

---

### Version: 0.1.0
**Date:** 2025/12/19
<details>
<summary>App Basis - Node.js & HTML</summary>
<br>

**Additions / Changes:**
<br>Replaced existing application files with a new version which uses Node.js and HTML (as opposed to pure JavaScript) to prepare for client-server operations.

**Bugs / Fixes:**
<br>No bugs found yet.
</details>

---