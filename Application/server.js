// mainly for faster testing following on from firebase introduction

import app from "./functions/app.js";

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Running locally on http://localhost:${PORT}`);
});