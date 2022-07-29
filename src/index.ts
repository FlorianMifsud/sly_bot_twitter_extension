import { TwitterApi } from "twitter-api-v2";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import * as twitter from "twitter-text";
import { Twitch_info_Live, Twitch_VOD } from "./twitch";
import {
    STREAMER_Interface,
    Twitch_Interface,
    Data_Interface,
    LAST_DATE_Interface,
} from "./interface";
import {
    parse_horaire,
    s,
    hhmmss_to_seconds,
    secondsToHms,
    get_streamer_by_prog,
    get_streamer_by_title,
    username_to_interface,
    replace_streamer_in_title,
    fin_crenaux,
} from "./snippets";
import * as d from "debug";
import { extension } from "./Schema";
dotenv.config();
const error = d.debug("app:error");
const info = d.debug("app:info");
const debug = d.debug("app:debug");
d.enable(process.env.DEBUG);
const userClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET_KEY,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

function tweet(message: string): void {
    if (process.env.NODE_ENV === "development") return;
    userClient.v1
        .tweet(message)
        .then(async (data) => {
            await extension.findOneAndUpdate(
                { _id: process.env.ID },
                { LAST_TWEET: data.id_str }
            );
            info("%O", data);
        })
        .catch((e) => {
            error("%O", e);
        });
}
async function run(): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) => {
        const remove = [0, 1, 2, 27, 28, 29, 30, 31, 32];
        fetch(
            "https://docs.google.com/spreadsheets/d/1yCaPsXrHvbpr6vmw5431WX7nbmU6Oplzf6oa5YFGk1w/gviz/tq?"
        )
            .then(async (text) => {
                if (text.ok) {
                    return await text.text();
                } else {
                    return reject(text);
                }
            })
            .then((data: string) => {
                const data_json = JSON.parse(
                    data
                        .split("\n")[1]
                        .replace(
                            /google.visualization.Query.setResponse\(|\);/g,
                            ""
                        )
                );

                let horaire = 0;
                const prog = {};

                data_json.table.rows.map((a: Array<string>, b: number) => {
                    if (remove.indexOf(b) === -1) {
                        if (a["c"]["0"] !== null) {
                            if (horaire >= 24) return;
                            horaire++;
                            for (let i = 1; i < 8; i++) {
                                const elem = a["c"][i];
                                if (
                                    !prog[
                                        data_json.table.rows[2].c[i].v
                                            .replace("\n", " ")
                                            .split(" ")[1]
                                    ]
                                ) {
                                    prog[
                                        data_json.table.rows[2].c[i].v
                                            .replace("\n", " ")
                                            .split(" ")[1]
                                    ] = {};
                                }
                                prog[
                                    data_json.table.rows[2].c[i].v
                                        .replace("\n", " ")
                                        .split(" ")[1]
                                ][parse_horaire(a["c"][0].v)] = undefined;
                                if (elem !== null) {
                                    prog[
                                        data_json.table.rows[2].c[i].v
                                            .replace("\n", " ")
                                            .split(" ")[1]
                                    ][parse_horaire(a["c"][0].v)] =
                                        username_to_interface(s(elem.v)).NAME; // Permet de renvoyer les pseudos directement
                                }
                            }
                        }
                    }
                    debug("%O", prog);
                    return resolve(prog);
                });
            })
            .catch((e) => error("%O", e));
    });
}

const get_url_vod = async (): Promise<string | void> =>
    new Promise<string | void>((resolve) => {
        return Twitch_VOD().then((last_vod) => {
            Twitch_info_Live().then((current_stream) => {
                const start_stream = new Date(
                    current_stream.started_at
                ).getTime();
                const now = new Date().getTime();
                const diffTime = Math.round(
                    Math.abs(now - start_stream) / 1000
                );
                debug(
                    "get_url_vod",
                    diffTime,
                    60 * 5 + hhmmss_to_seconds(last_vod.duration)
                );
                if (diffTime > 60 * 5 + hhmmss_to_seconds(last_vod.duration)) {
                    return resolve();
                }

                return resolve(`${last_vod.url}?t=${secondsToHms(diffTime)}`);
            });
        });
    });

function send_tweet(
    STREAMERS: Set<STREAMER_Interface>,
    next: LAST_DATE_Interface,
    twitch: Twitch_Interface,
    url: string | void,
    too_long: boolean
) {
    const to_map: Array<STREAMER_Interface> = [...STREAMERS];
    const next_streamer = username_to_interface(next.next_streamer).TWITTER;
    let phrase = `Actuellement en live ${to_map.map(
        (streamer) => streamer.TWITTER
    )} jusqu'à ${next.switch_hours}h
${!too_long ? `Suivi de ${next_streamer}` : ""}
Titre: ${twitch.title}
jeu: ${twitch.game_name}
${url}
https://www.twitch.tv/solary`;
    if (STREAMERS.has(username_to_interface("solary"))) {
        phrase = `Actuellement en live ${
            username_to_interface("solary").TWITTER
        }
${!too_long ? `Suivi de ${next_streamer}` : ""}
Titre: ${replace_streamer_in_title(twitch.title, "TWITTER")}
jeu: ${twitch.game_name}
${url}
https://www.twitch.tv/solary`;
    }
    const conform = twitter.parseTweet(phrase);
    debug(conform);
    if (conform.valid) {
        tweet(phrase);
    } else {
        send_tweet(STREAMERS, next, twitch, url, true);
    }
}

(async () => {
    await mongoose.connect(process.env.MONGO_URL);
    info("start", new Date());
    if (process.env.NODE_ENV !== "development") {
        await userClient.v1.updateAccountProfile({
            description: `Bot qui permet de savoir qui est sur la TV1 de Solary
    Last build: ${new Date().toLocaleString()}`,
        });
    }
    setInterval(() => {
        run()
            .then(async (data) => {
                await extension.findOneAndUpdate(
                    { _id: process.env.ID },
                    { PROG: data }
                );

                const json_data: Data_Interface = await extension.findOne({
                    _id: process.env.ID,
                });
                //prog_by_bdd = json_data.PROG,
                const modo_by_bdd: STREAMER_Interface = json_data.MODO_INFO,
                    twitch_info_by_bdd = json_data.TWITCH_INFO,
                    current_streamer_by_bdd = json_data.STREAMER,
                    today = new Date(),
                    twitch_info = await Twitch_info_Live(),
                    url_vod = await get_url_vod(),
                    url = url_vod ?? "",
                    streamer_by_prog = get_streamer_by_prog(data, today);

                let fin_creneau = fin_crenaux(data, today, streamer_by_prog);

                if (s(twitch_info.title) !== s(twitch_info_by_bdd.title)) {
                    info("Titre changé", twitch_info.title);
                    //Titre changé
                    const current_streamer: Set<STREAMER_Interface> = new Set();
                    const streamer_by_title: Set<STREAMER_Interface> =
                        get_streamer_by_title(twitch_info.title);
                    debug(streamer_by_title);
                    let tweet;
                    if (
                        s(streamer_by_prog) === s(current_streamer_by_bdd) &&
                        s(modo_by_bdd.NAME) === s(current_streamer_by_bdd)
                    ) {
                        current_streamer.add(
                            username_to_interface(streamer_by_prog)
                        );
                        debug("Meme streamer");
                        //Meme streamer il a juste update le titre
                        tweet = "reply";
                    } else if (s(modo_by_bdd.NAME) === s(streamer_by_prog)) {
                        debug("Commande modo + prog respecter");
                        //Si un modo !sharkk et que c'est sharkk sur la prog (sauf pour !solary)
                        current_streamer.add(
                            username_to_interface(modo_by_bdd.NAME)
                        );
                        tweet = "tweet";
                    }
                    if (
                        streamer_by_title.size === 0 &&
                        current_streamer.size === 0
                    ) {
                        debug(
                            "Aucun mot trigger dans le titre et modo & prog pas respecter la lose quoi"
                        );
                        //Personne dans le titre et !sharkk & prog pas respecter
                        current_streamer.add(
                            username_to_interface(streamer_by_prog)
                        );
                        tweet = "tweet";
                    } else if (
                        streamer_by_title.size === 0 &&
                        current_streamer.size >= 1
                    ) {
                        debug(
                            "Aucun mot trigger dans le titre et modo & prog respecter"
                        );
                        //Pas dans le titre mais !sharkk & prog respect
                        //tweet = "tweet";
                    } else if (
                        streamer_by_title.size >= 1 &&
                        current_streamer.size === 0
                    ) {
                        debug(
                            streamer_by_title.size,
                            " streamer dans le titre"
                        );
                        //pas sur la prog (ou c'est solary)
                        streamer_by_title.forEach(
                            (streamer: STREAMER_Interface) =>
                                current_streamer.add(streamer)
                        );
                        tweet = "tweet";
                    } else {
                        debug("KEKK");
                    }
                    debug("Size", current_streamer.size);

                    if (current_streamer.size === 1) {
                        debug("checkkk fin de creneau ?", current_streamer);
                        //1Seul streamer on le cherche dans le gdoc => si plusieurs ben glhf KEKL
                        fin_creneau = fin_crenaux(
                            data,
                            today,
                            current_streamer.values().next().value.NAME
                        );
                    }
                    if (current_streamer.size >= 1) {
                        await extension.findOneAndUpdate(
                            { _id: process.env.ID },
                            { PROG: data }
                        );
                        await extension.findOneAndUpdate(
                            { _id: process.env.ID },
                            {
                                TWITCH_INFO: twitch_info,
                            }
                        );
                        await extension.findOneAndUpdate(
                            { _id: process.env.ID },
                            {
                                STREAMER: s(
                                    current_streamer.values().next().value.NAME
                                ),
                            }
                        );

                        debug("good", tweet);
                        switch (tweet) {
                            case "tweet":
                                send_tweet(
                                    current_streamer,
                                    fin_creneau,
                                    twitch_info,
                                    url,
                                    false
                                );
                                break;
                            case "reply":
                                debug("reply");
                                break;
                            default:
                                break;
                        }
                    }
                }
            })
            .catch((e) => {
                error("%O", e);
            });
    }, 10000);
})();

export async function modo_streamer(
    streamer: STREAMER_Interface
): Promise<STREAMER_Interface> {
    debug(`CHANGEMENT DE STREAMER VIA MODO de ${streamer.NAME}`);
    await extension.findOneAndUpdate(
        { _id: process.env.ID },
        { MODO_INFO: streamer }
    );
    return streamer;
}
