# Project Log

The project log tracks progress for the project's research, documentation, and writing. The list also includes feedback from supervisor meetings and the improvements made following it.

For development progress, please see the [project changelog](./CHANGELOG.md).

All dates are in <code>YYYY/MM/DD DAY</code> format 

---

### 2025/07/16 WED - 2025/09/29 MON
<details>
<summary>Preliminary Research</summary>

Preliminary research to assess the project's complexity and devise possible approaches, including but not limited to:
- Researching the "Racetrack game" concept (["Racetrack game"](https://en.wikipedia.org/wiki/Racetrack_(game)))
- Analysing the web game "[Vector Racer](https://harmmade.com/vectorracer/)", an implementation of the Racetrack game
- Researching methods to represent and render tracks programmatically with splines (["Programming Racing Lines"](https://www.youtube.com/watch?v=FlieT66N9OM))
- Researching methods to calculate optimal racing lines with different factors
    - ["Dynamic programming for racing line optimization in Python"](https://www.youtube.com/watch?v=BuqoSJFyvVE)
    - ["Algorithms and insights for RaceTrack"](https://www.sciencedirect.com/science/article/pii/S0304397518302627?via%3Dihub)
- Researching frameworks, tools, and libraries to build the application (namely ["p5.js"](https://p5js.org/) and ["openFrameworks"](https://openframeworks.cc/))

Other tasks include preparing this project log, a changelog, and a requirements backlog with Azure DevOps.
</details>

---

### 2025/09/30 TUE
<details>
<summary>First Supervisor Meeting</summary>

- First supervisor meeting - overview of work done prior to meeting over the summer (research, plan, basic designs, etc.)
</details>

---

### 2025/10/02 THU
<details>
<summary>GitLab & Azure DevOps Preparation</summary>

- More GitLab preparations (changelog, readme, etc.)
- Refining requirements and categorising into Azure DevOps backlog
</details>

---

### 2025/10/03 FRI
<details>
<summary>Requirements & Screen Designs</summary>

- Documenting expected requirements for the MVP version, will continue to refine, then raise next supervisor meeting
- Starting screen designs and requirements documentation for subsequent versions
</details>

---

### 2025/10/06 MON
<details>
<summary>Backlog Snapshots</summary>

- Published first Azure DevOps backlog snapshot, which will be done every few weeks 
    - **NOTE:** future uploads will come with commit messages anyway, but this is the first one
</details>

---

### 2025/10/07 TUE - 2025/10/17 FRI
<details>
<summary>Technology Research & Planning</summary>

- Researched different technologies to use for aspects of the application (full stack), including:
    - **Databases:** MongoDB and NoSQL (especially since this is covered in one module, CO4217 Agile Cloud Automation), and MySQL
    - **Back End:** Node.js (nice pairing with JS for front end), and PHP
    - **Front End:** React.js (unsure whether this would be overkill)
    - **Rendering / Drawing:** regular JS, Phaser, Kaboom, and p5.js

- Held supervisor meeting on **2025/10/14 TUE**:
    - Showed completed project plan for feedback, will refine and revise current work
    - Reviewed some written user stories with and received feedback to "abstract" them, will adjust accordingly, **a meeting has been set for the following week**
    - Discussed technologies and the implementation of the project - rather than specifying web app technologies, will keep it "open" (especially since there may be non-web app tools that serve a better purpose)

- Better to update this log with every supervisor meeting I think (for synchrony)
</details>

---

### 2025/10/21 TUE
<details>
<summary>User Story Refinement</summary>

- As of the last supervisor meeting...
    - Focused on rewording user stories to be more abstract rather than implementation-based

- Held supervisor meeting on **2025/10/21 FRI** to discuss user stories
    - Showed revised user stories, abstracted into featureless tasks (better style than before)
    - Advised to create a glossary describing broad terms and what they entail, such as "Driver Controls" and "Race Results", to ensure consistency if these definitions change
</details>

---

### 2025/10/31 FRI
<details>
<summary>Interim Report Review & User Story Refinement</summary>

- No further work done since previous supervisor meeting due to illness and focussing on coursework for other modules

- Held supervisor meeting on **2025/10/31 FRI** to review Interim Report
    - Discussed Interim Report
        - Cursorily showed research and structure, discussed future plan and approach
        - Asked how to tie interlinked topics together, mainly Design and Architecture (as they inform each other) - advised to start with Architecture, then Design (which makes sense)
        - Discussed what aims and objectives are, and refined my existing aims and objectives
        - Compared my Interim Report to the Interim Report I wrote for my CS project last year, maintained positives and applied improvements (mainly around objectives to keep implementation-free)
    - Discussed Project Plan feedback
        - Change title from "An Implementation of the Racetrack Game" to "'[Game Name]': An Implementation of the Racetrack Game" (to make more specific)
        - Project timeline feedback (specify dates rather than weeks, also include corusework from other modules to work around)
</details>

---

### 2025/11/03 MON - 2025/11/09 SUN
<details>
<summary>Reading Week - Minimal Progress</summary>

- Reading week: mostly preoccupied with other assignments, so no significant work was done for the project
</details>

---

### 2025/11/11 TUE
<details>
<summary>Interim Report Refinement (structure)</summary>

- As of the last supervisor meeting:
    - More work on Interim Report based on feedback from last supervisor session
        - Refined wording of aims and objectives to fit with the project
        - Updated time to include work done prior to Interim Report submission date

- Held supervisor meeting on **2025/11/11 TUE** to review Interim Report
    - Discussed updated structure and flow of the Interim Report more
    - Discussed ways to cut down the Interim Report length to be more succinct
</details>

---

### 2025/11/18 TUE
<details>
<summary>Interim Report Refinement (conciseness)</summary>

- As of the last supervisor meeting:
    - More Interim Report writing based on the last meeting's feedback

- Held supervisor meeting on **2025/11/18 TUE**
    - Discussed length of Interim Report and where to be more concise
        - Reword game presentation section to suggest they were the ones you found (unless more games are found then you select them)
        - Elaborate more where "better UX" (and similar phrasing) is used
        - Ensure concepts flow without having to backtrack to much as a reader
        - Move key design discussions (eg. leaderboard choices, car types, controls, etc.) from the games to design section
        - Merge all class diagrams into one diagram: use aggregate & composition arrows for conciseness
</details>

---

### 2025/11/19 WED - 2025/11/20 - THU (submission)
<details>
<summary>Interim Report Submission</summary>

- Applied feedback discussed in last supervisor meeting
- Finalised Interim Report's research discussion, architecture & design approaches, class diagrams, and project timelines
- Submitted Interim Report on **2025/11/20 THU**
</details>

---

### 2025/11/25 TUE
<details>
<summary>Partial External Prototype (Version 0 - Roblox Studio)</summary>

- As of the last supervisor meeting:
    - Created a small prototype using a game development tool I'm more familiar with called Roblox Studio
        - Helps focus more on UX, logic and development than the specifics of how to use whatever the tool is
        - This helps realise design potholes earlier to reconsider choices 
        - Features include:
            - Basic Main Menu with placeholder section buttons
            - Basic Track Builder UI with placeholder tool buttons
            - Ability to create nodes representing the track (automatically connected)
            - Enough nodes (4+) form a placeholder spline representing the true form of the track
    - The code will be converted to JavaScript once happier with the initial structure to replicate
    - Published a snapshot of the backlog in preparation for development
    - Added a link to the glossary Wiki page in the Azure DevOps repository

- Held a supervisor meeting on **2025/11/25 TUE**
    - Discussed **Roblox Studio** prototype
        - Explained the prototype's features, how they relate to the game, and the future plans for it
        - Explained the purpose of the prototype (to find design potholes): good idea!
        - Will require work to convert to HTML / JS - leave enough time for this (will move forward with main version only eventually)
        - UI can seem oversized depending on screen size (planned to consider for the main prototype)
        - Think about detection logic & material velocity effects (detection factored in when discussing Interim Report, but velocity effects still need to be considered)
    - **Note:** as this is an *external* prototype, it has not been included in the changelog, but its details are mentioned here
</details>

---

### 2025/12/09 TUE
<details>
<summary>Full External Prototype (Version 0 - Roblox Studio)</summary>

- As of the last supervisor meeting:
    - More prototype development (completed V0 with **Roblox Studio**):
        - Implemented rendering the single spline as a track with varying thickness
        - Implemented the ability to create a track with nodes of varying thickness
        - Implemented a basic track list with a single basic track to play
        - Implemented race car movement controls according to the Racetrack game
        - Implemented the ability to complete tracks and see the results of the race
    - Will implement V0 with the intended web technologies next!

- Held a supervisor meeting on **2025/12/09 TUE**
    - Demonstrated V0: discussed underlying functionality, algorithms, and differences between the prototype and main version
        1. Easier to set up client-server operations with Roblox Studio (more difficult with Web Sockets)
        2. HTML allows free drawing and overall performs better for rendering (not limited by triangles)
        3. Possibly more difficult to implement UI & interactivity with HTML than with Roblox Studio (no pre-built UI with HTML per se)

- **IMPORTANT NOTE:** while track building is intended for V1, the basis of track building with points was included as it can be seen as a precursor to track rendering, which makes creating a simple track to test easier.
</details>

---

### 2025/12/23 TUE
<details>
<summary>Prototype Transfer - Intended Technologies (Part 1)</summary>

- Checkpoint entry, as the next supervisor meeting will be on **2026/01/07 WED**
- As of the last entry:
    - Implemented v0.1.0 - v0.3.0 (see changelog)
    - Removed tasks from backlog for brevity and to reduce excessive "admin"
</details>

---

### 2026/01/07 WED
<details>
<summary>Prototype Transfer - Intended Technologies (Part 2)</summary>

- As of the last entry:
    - Implemented v0.4.0 - v0.6.0 (see changelog)
    - Updated Backlog Snapshot naming convention to go by version (vX.Y) rather than date
    - Separated "Bugs / Fixes" header in changelog into "Bugs Fixed" and "Bugs Discovered"

- Supervisor meeting held on **2026/01/07 WED**
    - Overview of current progress (transition from Roblox version to version with intended technologies)
    - Similarities & differences between versions (mainly rendering with HTML canvas rather than GUI elements)
    - Review of unit tests (covers most V0 features)
    - Overview of plan for V1 (see Backlog Snapshots for V1 requirements)

</details>

---

### 2026/01/22 THU
<details>
<summary>V1 - Transition from V0, and Materials / Obstacles / Decorations</summary>

- As of the last entry:
    - Implemented v1.0.0 - v1.3.0 (see changelog)

- Supervisor meeting held on **2026/01/22 THU**
    - Demonstrated work done so far & updated on future plans
    - Discussed interview preparation (what kinds of topics to talk about, flow & structure, etc.)
    - Will prepare slide deck to review for next meeting

</details>

---

### 2026/02/05 THU
<details>
<summary>Track Saving & Listing</summary>

- As of the last entry:
    - Implemented v1.4.0 - v1.6.0 (see changelog)
    - Prepared draft slide deck for interview to review in the meeting

- Supervisor meeting held on **2026/02/05 THU**
    - Discussed presentation slides improvement (split up slides, add pictures, avoid redundancy to save time, may be good to interweave demo!)

</details>

---

### 2026/03/05 THU
<details>
<summary>V2 Completion & Project Interview</summary>

- As of the last entry:
    - Implemented v1.7.0 - v1.8.0 (see changelog)
    - Interview held on **2026/02/11 WED**
    - ! MAJOR set back in work due to external factors (about 1 month behind schedule)...

- Supervisor meeting held on **2026/03/05 THU**
    - Discussed progress made since last actual showing (about 1.5 months)
    - Discussed possibility of cutting out secondary objectives and how to write in dissertation
    - Future plans (remaining versions, dissertation, etc.)

</details>

---

### 2026/03/19 THU
<details>
<summary>Local Multiplayer & Basic AI</summary>

- As of the last entry:
    - Implemented v2.0.0 - v2.1.0 (see changelog)

- Supervisor meeting to be held on **2026/03/19 THU**
    - ...

</details>
