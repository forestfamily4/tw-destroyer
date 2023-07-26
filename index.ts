import { Account } from "twitter-api-client-ts";
import dotenv from "dotenv";
import axios from "axios";
import { schedule } from "node-cron";
import { existsSync, readFileSync, writeFile, writeFileSync } from "fs";
import express from "express";

dotenv.config();

const app: express.Express = express();
app.use(express.static("public"));
app.get("/*", (req, res) => {
  res.redirect("/static");
});
app.listen(3000);
const client = new Account(
  env("email"),
  env("usrname"),
  env("password"),
  false,
  false
);
client.login().then(() => {
  main(client);
  schedule("2 * * * *", () => {
    main(client);
  });
});
if (!existsSync("id.txt")) {
  writeFileSync("id.txt", "");
}

async function main(client: Account) {
  const userTweets = await client.gql("GET", "UserTweets", {
    userId: env("userId"),
  });
  const userData = await client.gql("GET", "UserByRestId", {
    userId: env("userId"),
  });

  const userIcon = userData.data.user.result.legacy.profile_image_url_https;
  const userScreenName = userData.data.user.result.legacy.screen_name;
  const userName = userData.data.user.result.legacy.name;

  const entries =
    userTweets.data.user.result.timeline_v2.timeline.instructions.filter(
      (x: any) => x.type === "TimelineAddEntries"
    )[0].entries;

  const result = entries
    .map((e: any) => {
      return e.content?.itemContent?.tweet_results?.result?.legacy;
    })
    .filter((x: any) => x !== undefined)
    .filter((x: any) => x.user_id_str === env("userId"))
    .filter((x: any) => x.entities?.media?.length > 0)
    .map((x: any) => {
      return {
        id: x.id_str,
        text: x.full_text,
        media: x.entities.media.map((m: any) => m.media_url_https),
      };
    });

  console.log(new Date());
  statusLog();

  for await (const r of result) {
    if (!idCheck(r.id)) {
      await axios.post(
        env("webhookUrl"),
        {
          content: `https://fxtwitter.com/status/${r.id}`,
          avatar_url: userIcon,
          username: `${userName} (@${userScreenName})`,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

function idCheck(id: string) {
  const data = readFileSync("id.txt", "utf-8");
  const a = data.split("\n").some((x) => {
    if (x === id) {
      return true;
    }
  });
  if (!a) {
    writeFileSync("id.txt", data + id + "\n");
  }
  return a;
}

function env(s: string) {
  const k = process.env[s];
  if (!k) {
    throw new Error(`env ${s} is not defined`);
  }
  return k;
}

async function statusLog() {
  let data = readFileSync("public/status_report.log", "utf-8");
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  const dateStr = `${year}-${month}-${day} ${hour}:${minute}`;
  data += `\n${dateStr},success`;

  writeFile("public/status_report.log", data, (err) => {});
}
