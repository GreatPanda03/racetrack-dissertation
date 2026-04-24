// leaderboard schema for MongoDB database

import mongoose from "mongoose";

const Schema = mongoose.Schema;

const scoreSchema = new Schema({
    time: {
        type: Number,
        required: true
    },
    moves: {
        type: [Schema.Types.Mixed],
        required: true
    },
    date: {
        type: Date,
        required: true
    }
}, { strict: false, _id: false });

const leaderboardSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    scores: {
        type: Map,
        of: {
            type: Map,
            of: scoreSchema
        },
        default: {}
    }
});

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

export default Leaderboard;