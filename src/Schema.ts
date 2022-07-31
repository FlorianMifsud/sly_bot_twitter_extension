import mongoose from "mongoose";
mongoose.pluralize(null);
const { Schema } = mongoose;
const extension = mongoose.model(
    "extension_data",
    new Schema(
        {
            TWITCH_INFO: { type: Object },
            STREAMER: { type: String },
            MODO_INFO: { type: Object },
            LAST_TWEET: { type: String },
            PROG: { type: Object },
        },
        { timestamps: true }
    )
);
const streamers = mongoose.model(
    "streamer_solary",
    new Schema(
        {
            NAME: { type: String, unique: true },
            RS: { type: Object },
            NICKNAME: { type: Array, unique: true },
            OVERLAY_ID: { type: Array, unique: true },
        },
        { timestamps: true }
    )
);

export { extension, streamers };
