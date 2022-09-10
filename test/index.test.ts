import * as STREAMER from "../src/streamers";
import * as fs from "fs";
import * as snippets from "../src/snippets";
import { equal } from "assert";
let data;
const date = new Date("2022 07 28 17:00:00");
before(function (done) {
    fs.readFile(
        "./test/extension_datas.json",
        "utf8",
        function (err, fileContents) {
            if (err) throw err;
            data = JSON.parse(fileContents);
            done();
        }
    );
});

describe("NEXT STREAMER", () => {
    it("next streamer switch hours", () => {
        equal(
            snippets.fin_crenaux(data.PROG, date, STREAMER.WAKZ.NAME)
                .switch_hours,
            19
        );
    });
    it("next streamer name", () => {
        equal(
            snippets.fin_crenaux(data.PROG, date, STREAMER.WAKZ.NAME)
                .next_streamer,
            STREAMER.SOLARY.NAME
        );
    });

    it("next streamer change day", () => {
        equal(
            snippets.fin_crenaux(
                data.PROG,
                new Date("2022 07 26 22:00:00"),
                STREAMER.NARKUSS.NAME
            ).next_streamer,
            STREAMER.TIOO.NAME
        );
    });
    it("next streamer switch hours", () => {
        equal(
            snippets.fin_crenaux(
                data.PROG,
                new Date("2022 07 26 22:00:00"),
                STREAMER.NARKUSS.NAME
            ).switch_hours,
            1
        );
    });
});
describe("GET STREAMER", () => {
    it("by prog", () => {
        equal(
            snippets.get_streamer_by_prog(data.PROG, date),
            STREAMER.WAKZ.NAME
        );
    });
    it("by title", () => {
        equal(
            [...snippets.get_streamer_by_title(data.TWITCH_INFO.title)][0].NAME,
            [...new Set([STREAMER.CAELAN])][0].NAME
        );
    });
    it("no streamer in title", () => {
        equal(snippets.get_streamer_by_title("bad title").size, 0);
    });
    it("change title to at twitter", () => {
        equal(
            "@LRB_LoL test le renek",
            snippets.replace_streamer_in_title(
                `${STREAMER.LRB.NAME} test le renek`,
                "TWITTER"
            )
        );
    });
});
