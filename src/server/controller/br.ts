import { Router } from "express";
import { fin_crenaux } from "../../snippets";
import mongoose from "mongoose";
import { extension } from "../../Schema";
const BRController = Router();

/**
 * Trouve tous les animaux
 */
BRController.get("/:chatty?", async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const json_data = await extension.findOne({
            _id: process.env.ID,
        }),
        prog_by_bdd = json_data.PROG,
        fin_creneau = fin_crenaux(prog_by_bdd, new Date(), json_data.STREAMER),
        fin_br = new Date();

    fin_br.setHours(fin_creneau.switch_hours);
    fin_br.setMinutes(0);
    fin_br.setSeconds(0);
    fin_br.setMilliseconds(0);
    if (new Date().getTime() >= fin_br.getTime())
        fin_br.setHours(fin_br.getHours() + 1);
    const result = {
        seconds: Math.round((fin_br.getTime() - new Date().getTime()) / 1000),
        fin_creneau,
        fin_br,
    };
    if (req.params.chatty) {
        return res.status(200).json(result.seconds);
    }

    return res.status(200).json(result);
});

export { BRController };
