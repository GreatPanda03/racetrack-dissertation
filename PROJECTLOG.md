# Project Log

The project log tracks progress for the project's research, documentation, and writing. The list also includes feedback from supervisor meetings and the improvements made following it.

For development progress, please see the [project changelog](./CHANGELOG.md).

All dates are in <code>YYYY/MM/DD DAY</code> format 


## 2025/07/16 WED - 2025/09/29 MON

Preliminary research to assess the project's complexity and devise possible approaches, including but not limited to:
- Researching the "Racetrack game" concept (["Racetrack game"](https://en.wikipedia.org/wiki/Racetrack_(game)))
- Analysing the web game "[Vector Racer](https://harmmade.com/vectorracer/)", an implementation of the Racetrack game
- Researching methods to represent and render tracks programmatically with splines (["Programming Racing Lines"](https://www.youtube.com/watch?v=FlieT66N9OM))
- Researching methods to calculate optimal racing lines with different factors
    - ["Dynamic programming for racing line optimization in Python"](https://www.youtube.com/watch?v=BuqoSJFyvVE)
    - ["Algorithms and insights for RaceTrack"](https://www.sciencedirect.com/science/article/pii/S0304397518302627?via%3Dihub)
- Researching frameworks, tools, and libraries to build the application (namely ["p5.js"](https://p5js.org/) and ["openFrameworks"](https://openframeworks.cc/))

Other tasks include preparing this project log, a changelog, and a requirements backlog with Azure DevOps.

## 2025/09/30 TUE
- First supervisor meeting - overview of work done prior to meeting over the summer (research, plan, basic designs, etc.)


## 2025/10/02 THU
- More GitLab preparations (changelog, readme, etc.)
- Refining requirements and categorising into Azure DevOps backlog

## 2025/10/03 FRI
- Documenting expected requirements for the MVP version, will continue to refine, then raise next supervisor meeting
- Starting screen designs and requirements documentation for subsequent versions

## 2025/10/06 MON
- Published first Azure DevOps backlog snapshot, which will be done every few weeks 
    - **NOTE:** future uploads will come with commit messages anyway, but this is the first one

## 2025/10/07 TUE - 2025/10/17 FRI
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

## 2025/10/21 TUE
- As of the last supervisor meeting...
    - Focused on rewording user stories to be more abstract rather than implementation-based

- Held supervisor meeting on **2025/10/21 FRI** to discuss user stories
    - Showed revised user stories, abstracted into featureless tasks (better style than before)
    - Advised to create a glossary describing broad terms and what they entail, such as "Driver Controls" and "Race Results", to ensure consistency if these definitions change

## 2025/10/31 FRI
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

## 2025/11/03 MON - 2025/11/09 SUN
- Reading week: mostly preoccupied with other assignments, so no significant work was done for the project

## 2025/11/11 TUE
- As of the last supervisor meeting:
    - More work on Interim Report based on feedback from last supervisor session
        - Refined wording of aims and objectives to fit with the project
        - Updated time to include work done prior to Interim Report submission date

- Held supervisor meeting on **2025/11/11 TUE** to review Interim Report
    - Discussed updated structure and flow of the Interim Report more
    - Discussed ways to cut down the Interim Report length to be more succinct

## 2025/11/18 TUE
- As of the last supervisor meeting:
    - More Interim Report writing based on the last meeting's feedback

- Held supervisor meeting on **2025/11/18 TUE**
    - Discussed length of Interim Report and 
        - Reword game presentation section to suggest they were the ones you found (unless more games are found then you select them)
        - Elaborate more where "better UX" (and similar phrasing) is used
        - Ensure concepts flow without having to backtrack to much as a reader
        - Move key design discussions (eg. leaderboard choices, car types, controls, etc.) from the games to design section
        - Merge all class diagrams into one diagram: use aggregate & composition arrows for conciseness

## 2025/11/19 WED - 2025/11/20 - THU (submission)
- Applied feedback discussed in last supervisor meeting
- Finalised Interim Report's research discussion, architecture & design approaches, class diagrams, and project timelines
- Submitted Interim Report on **2025/11/20 THU**

## 2025/11/25 TUE
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
    - Discussed Roblox Studio prototype
        - Explained the prototype's features, how they relate to the game, and the future plans for it
        - Explained the purpose of the prototype (to find design potholes): good idea!
        - Will require work to convert to HTML / JS - leave enough time for this (will move forward with main version only eventually)
        - UI can seem oversized depending on screen size (planned to consider for the main prototype)
        - Think about detection logic & material velocity effects (detection factored in when discussing Interim Report, but velocity effects still need to be considered)

# 2025/12/09 TUE
- As of the last supervisor meeting:
    - More prototype development:
        - Implemented rendering the single spline as a track with varying thickness
        - ...

- Will hold a supervisor meeting on **2025/12/09 TUE**
    - ...