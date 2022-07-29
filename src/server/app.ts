import cors from "cors";
import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import { BRController } from "./controller/br";

export const app = express();

app.use(express.json());

app.use("/br", BRController);

app.all("*", (req, res) => res.send("Hello World !"));
