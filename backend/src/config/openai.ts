import Openai from "openai";
import { config } from "./env.js";

export const openai = new Openai({
    apiKey: config.OPENAI_API_KEY,
});