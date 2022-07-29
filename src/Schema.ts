import mongoose from "mongoose";
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

export { extension };
