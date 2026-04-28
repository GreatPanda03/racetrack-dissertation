# "Tracer Racers" - An Implementation of the "Racetrack" Game

## 1. Introduction
This repository tracks all development progress and documentation for the project, ***"Tracer Racers" - An Implementation of the "Racetrack" Game***. It is based on the original [Racetrack game concept](https://campus.cs.le.ac.uk/teaching/proposals/v24167.the_racetrack_game).

> **Dissertation Abstract:**
> *"The Racetrack game is a pencil-and-paper game in which players must race around a track in turns with vectors. A few computer games based on the Racetrack concept exist, but they tend to be simple, with minimal gameplay features, or each has features that others lack, which would be interesting to combine. This project aims to recreate and build upon the Racetrack game in these areas, producing a web application built with HTML, JavaScript, Node.js, MongoDB and Firebase Hosting & Authentication. The application extends on the features with spline-based track building, leaderboards, online capabilities, AI racers, and a selection of car types. The project managed to fulfil all original objectives using Node.js and Firebase, but could be improved in terms of security and gameplay."*

## 2. Contents
The GitLab repository contains the project's source code, where occassional code commits are provided. Each commit details new application functionality, changes, and removals. The table below lists its contents:

| **Item**                | **Description**|
| :----------------------:|----------------|
| **Application**         | The main source code for the application. For steps on how to execute it, please see **Section 4**. The dissertation explains the contents of the `Application` folder itelf in more detail. |
| **Backlog Snapshots**   | A folder containing a snapshot of the external DevOps backlog, which tracks the status of requirements with each version. For more details, please see **Section 3**.|
| **Other Files**         | A copy of the submissions made throughout the project for reference. 
| **`CHANGELOG.md`**      | A list of application versions. Each version includes a summary of what has been implemented, including features, bug fixes, and discovered bugs.|
| **`PROJECTLOG.md`**     | A list of project log entries. Each entry describes what has been done between it and the previous entry. Entries typically follow a biweekly pattern to match the cadence of supervisor meetings.|

For more information about these changes, please see the [changelog](./CHANGELOG.md). For details about project progression itself, please see the [project log](./PROJECTLOG.md).

## 3. Backlog
A separate [Azure DevOps](https://azure.microsoft.com/en-us/products/devops) repository includes the project's requirements and development work. Each requirement has a description, acceptance criteria, a priority, and a label for the its current stage. This enables a smoother requirements gathering and organisation experience.

The project and its backlog are publicly available, but an email account may be required to log in: 
[project backlog](https://dev.azure.com/MuhammadsOrganisation/CS%20Project%20II/_backlogs/backlog/CS%20Project%20II%20Team/Project). A glossary of the requirements has also been included: [project glossary](https://dev.azure.com/MuhammadsOrganisation/CS%20Project%20II/_wiki/wikis/CS-Project-II.wiki/7/Glossary-of-Terms)

In the event the backlog is not accessible, periodic [backlog snapshots](./BacklogSnapshots) have been provided.

## 4. Installation
The `Application` folder contains all software artefacts for the project. Assume all directories mentioned under this section start from this root.

There are several ways to access the application, listed below. Please note that, for all methods, you will need a **stable Internet connection** run the application, as it uses external platforms like Firebase and MongoDB Atlas.

### 4.1. Access Online
The latest version of the application is already hosted at the URL https://tracer-racers.web.app/. It may take some time to load. The website can be accessed from any machine, but you may wish to run it locally if you encounter any issues.

### 4.2. Access Locally
Before running the application locally, please install its dependencies on your machine with the steps below:
1. Install `Node.js` from the Node.js website link: https://nodejs.org/en/.
2. `cd` to the `Application` folder.
3. Install all packages using `npm install`.

Once all packages are installed, there are two ways to run the application locally.

1. **Using a Firebase emulator:** execute the command `firebase emulators:start`. This will set up emulators which mimic the Firebase environment. This can be accessed through `http://localhost:5000`.

2. **Entirely locally:** execute the command `nodemon local-mode` (or `node local-mode` if `nodemon` is not installed). This can be accessed through `http://localhost:3000`.


## 5. Tests

To run the application tests, please follow the steps above to install Node.js and all dependency packages, as you will need `vitest` to execute them.

Once the packages have been installed, run the command `npm run test`. This will execute all tests individually, dispalying their group and test name. It may take some time to perform all of them.

## 6. Contact
For questions or additional information, please contact **Muhammad Mogra**.
<br/>**Email:** mm994@student.le.ac.uk
<br/>**Student ID:** 219001683