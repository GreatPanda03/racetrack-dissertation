// runs the app locally
// * use "nodemon local-mode"
// * mainly for faster testing away from Firebase
// * can also use firebase emulators ("firebase emulators:start")
//     essentially the same thing

import app from "./functions/app.js";

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Running locally on http://localhost:${PORT}`);
});