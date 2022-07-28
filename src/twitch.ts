import Client, { ECommand } from "tw-irc";
import { Twitch_Interface, Twitch_Last_Vod_Interface } from "./interface";
import { s, username_to_interface } from "./snippets";
import { modo_streamer } from "./index";
import * as d from "debug";
const debug = d.debug("app:debug");
const info = d.debug("app:info");
const { Message } = ECommand;
const client = new Client();
export async function Twitch_info_Live(): Promise<Twitch_Interface> {
    return new Promise<Twitch_Interface>((resolve, reject) => {
        return fetch("https://api.twitch.tv/helix/streams?user_id=174955366", {
            headers: {
                "Client-Id": process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${process.env.TWITCH_OAUTH}`,
            },
        })
            .then((json) => json.json())
            .then((data) => resolve(data.data[0]))
            .catch(reject);
    });
}
export async function Twitch_VOD(): Promise<Twitch_Last_Vod_Interface> {
    return new Promise<Twitch_Last_Vod_Interface>((resolve, reject) => {
        return fetch(
            "https://api.twitch.tv/helix/videos?user_id=174955366&type=archive",
            {
                headers: {
                    "Client-Id": process.env.TWITCH_CLIENT_ID,
                    Authorization: `Bearer ${process.env.TWITCH_OAUTH}`,
                },
            }
        )
            .then((json) => json.json())
            .then((data) => resolve(data.data[0]))
            .catch(reject);
    });
}
client.on(Message, ({ message, badges }) => {
    if (badges === null) return;
    if (message[0] !== "!") return;
    if (
        Object.keys(badges).includes("moderator") ||
        Object.keys(badges).includes("broadcaster")
    ) {
        const streamer = s(message).split(" ")[0];
        const command = username_to_interface(streamer);
        debug(streamer);
        if (s(command.NAME) === s("solary")) return;
        if (typeof command !== "undefined") modo_streamer(command);
        info(`Modo use ${streamer}`);
    }
});

client.onConnected(() => {
    client.channels.join("solary");
});

client.connect();
