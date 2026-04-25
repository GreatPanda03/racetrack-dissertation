// track schema for MongoDB database

import mongoose from "mongoose";

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
}, { strict: false });

const Track = mongoose.model("Track", trackSchema);

export default Track;