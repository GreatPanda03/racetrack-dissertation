const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trackSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    authorId: {
        type: String,
        required: true
    }
});

const Track = mongoose.model("Track", trackSchema);

module.exports = Track;