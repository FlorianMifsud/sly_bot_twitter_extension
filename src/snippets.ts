import { STREAMER_Interface } from "./interface";
import { STREAMERS } from "./streamers";
import * as d from "debug";
const get_streamer_by_title = (title: string): Set<STREAMER_Interface> => {
    const get_streamer_by_title_debug = d.debug(
        "snippets:get_streamer_by_title_debug"
    );
    const string = title.toLowerCase().split(" ");
    const list_streamer: Set<STREAMER_Interface> = new Set();
    string.map((word) => {
        word = s(word);
        STREAMERS.map((streamer) => {
            if (s(streamer.NAME) == word) list_streamer.add(streamer);
            if (streamer.SURNOM.find((surnom) => s(surnom) === word)) {
                list_streamer.add(streamer);
            }
        });
    });
    get_streamer_by_title_debug(list_streamer);
    return list_streamer;
};
const replace_streamer_in_title = (title: string, type: string): string => {
    const replace_streamer_in_title_debug = d.debug(
        "snippets:replace_streamer_in_title"
    );
    const string = title.split(" ");
    string.map((word, i) => {
        word = s(word);
        STREAMERS.map((streamer) => {
            if (s(streamer.NAME) == word) {
                string[i] = streamer[type.toUpperCase()];
            }
            if (streamer.SURNOM.find((surnom) => s(surnom) === word)) {
                string[i] = streamer[type.toUpperCase()];
            }
        });
    });
    replace_streamer_in_title_debug(string.join(" "));
    return string.join(" ");
};

export const fin_crenaux = (
    data: unknown,
    today: Date,
    streamer: string
): {
    today: Date;
    current_streamer: string;
    switch_hours: number;
    next_streamer: string;
} => {
    const fin_crenaux_debug = d.debug("snippets:fin_crenaux");
    today.setHours(today.getHours() + 1);
    const date = FormatDate(today);
    const hours = today.getHours();

    if (typeof data[`${date}`][`${hours}`] === "undefined") {
        return fin_crenaux(data, today, s(streamer));
    }
    if (
        typeof data[`${date}`][`${hours}`] === "string" &&
        s(data[`${date}`][`${hours}`]) === s(streamer)
    ) {
        return fin_crenaux(data, today, s(streamer));
    }

    //if (s(streamer) === data[`${params.date}`][`${hours}`])
    //return fin_crenaux(data, today, s(streamer));

    today.setHours(today.getHours() - 1);
    fin_crenaux_debug({
        today,
        current_streamer: s(streamer),
        switch_hours: hours,
        next_streamer: data[`${date}`][`${hours}`],
    });
    return {
        today,
        current_streamer: s(streamer),
        switch_hours: hours,
        next_streamer: data[`${date}`][`${hours}`],
    };
};

const username_to_interface = (stream: string): STREAMER_Interface =>
    STREAMERS.find(
        (streamer) =>
            s(streamer.NAME) === s(stream) ||
            streamer.SURNOM.find((surnom) => s(surnom) === s(stream))
    ) ?? STREAMERS.find((streamer) => s(streamer.NAME) === s("solary"));

const get_streamer_by_prog = (data: unknown, today: Date): string => {
    const get_streamer_by_prog_debug = d.debug("snippets:get_streamer_by_prog");
    const date = FormatDate(today);
    if (typeof data[`${date}`][`${today.getHours()}`] === "string") {
        get_streamer_by_prog_debug(data[`${date}`][`${today.getHours()}`]);
        return data[`${date}`][`${today.getHours()}`];
    }
    today.setHours(today.getHours() - 1);
    return get_streamer_by_prog(data, today);
};

function hhmmss_to_seconds(date: string): number {
    let minutes;
    let seconds;
    const hours = date.split("h");
    if (hours.length == 2) {
        // format 10h11m20s
        minutes = hours[1].split("m");
        if (minutes.length == 2) {
            // format 10h11m20s
            seconds = minutes[1].split("s");
        }
    } else {
        // format 11m20s
        minutes = hours[0].split("m");
        if (minutes.length == 2) {
            // format 10h11m20s
            seconds = minutes[1].split("s");
        } else {
            seconds = minutes[0].split("s");
        }
    }
    return hours.length == 2
        ? parseInt(hours[0]) * 3600 +
              parseInt(minutes[0]) * 60 +
              parseInt(seconds[0])
        : minutes.length == 2
        ? parseInt(minutes[0]) * 60 + parseInt(seconds[0])
        : parseInt(seconds[0]);
}

const secondsToHms = (d: number): string => {
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);

    const hDisplay = h > 0 ? `${h}h` : "";
    const mDisplay = m > 0 ? `${m}m` : "";
    const sDisplay = s > 0 ? `${s}s` : "";
    return hDisplay + mDisplay + sDisplay;
};
const s = (s: string): string =>
    s.toLowerCase().replace(/\s+/g, "").replace(/!/g, "").replace(/,/g, "");
const parse_horaire = (horaire: string) =>
    horaire
        .replace(/h/gi, "")
        .replace(/\//gi, "-")
        .replace(/ /gi, "")
        .split("-")[0];
const zero_Date = (a: number) => `0${a}`.slice(-2);
const FormatDate = (today: Date) =>
    `${zero_Date(today.getDate())}/${zero_Date(
        today.getMonth() + 1
    )}/${today.getFullYear()}`;

export {
    FormatDate,
    zero_Date,
    parse_horaire,
    s,
    secondsToHms,
    hhmmss_to_seconds,
    get_streamer_by_prog,
    get_streamer_by_title,
    replace_streamer_in_title,
    username_to_interface,
};
