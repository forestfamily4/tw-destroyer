"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twitter_api_client_ts_1 = require("twitter-api-client-ts");
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const node_cron_1 = require("node-cron");
const fs_1 = require("fs");
const express_1 = __importDefault(require("express"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.static("public"));
app.get("/*", (req, res) => {
    res.redirect("/static");
});
app.listen(3000);
const client = new twitter_api_client_ts_1.Account(env("email"), env("usrname"), env("password"), false, false);
client.login().then(() => {
    main(client);
    (0, node_cron_1.schedule)("2 * * * *", () => {
        main(client);
    });
});
if (!(0, fs_1.existsSync)("id.txt")) {
    (0, fs_1.writeFileSync)("id.txt", "");
}
async function main(client) {
    const userTweets = await client.gql("GET", "UserTweets", {
        userId: env("userId"),
    });
    const userData = await client.gql("GET", "UserByRestId", {
        userId: env("userId"),
    });
    const userIcon = userData.data.user.result.legacy.profile_image_url_https;
    const userScreenName = userData.data.user.result.legacy.screen_name;
    const userName = userData.data.user.result.legacy.name;
    const entries = userTweets.data.user.result.timeline_v2.timeline.instructions.filter((x) => x.type === "TimelineAddEntries")[0].entries;
    const result = entries
        .map((e) => {
        return e.content?.itemContent?.tweet_results?.result?.legacy;
    })
        .filter((x) => x !== undefined)
        .filter((x) => x.user_id_str === env("userId"))
        .filter((x) => x.entities?.media?.length > 0)
        .map((x) => {
        return {
            id: x.id_str,
            text: x.full_text,
            media: x.entities.media.map((m) => m.media_url_https),
        };
    });
    console.log(new Date());
    statusLog();
    for await (const r of result) {
        if (!idCheck(r.id)) {
            await axios_1.default.post(env("webhookUrl"), {
                content: `https://fxtwitter.com/status/${r.id}`,
                avatar_url: userIcon,
                username: `${userName} (@${userScreenName})`,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
}
function idCheck(id) {
    const data = (0, fs_1.readFileSync)("id.txt", "utf-8");
    const a = data.split("\n").some((x) => {
        if (x === id) {
            return true;
        }
    });
    if (!a) {
        (0, fs_1.writeFileSync)("id.txt", data + id + "\n");
    }
    return a;
}
function env(s) {
    const k = process.env[s];
    if (!k) {
        throw new Error(`env ${s} is not defined`);
    }
    return k;
}
async function statusLog() {
    let data = (0, fs_1.readFileSync)("public/status_report.log", "utf-8");
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const dateStr = `${year}-${month}-${day} ${hour}:${minute}`;
    data += `\n${dateStr},success`;
    (0, fs_1.writeFile)("public/status_report.log", data, (err) => { });
}