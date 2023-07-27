import { Account } from "twitter-api-client-ts";
import dotenv from "dotenv";
import axios from "axios";
import { schedule } from "node-cron";
import { existsSync, readFileSync, writeFile, writeFileSync } from "fs";
import express from "express";
import { execSync } from "child_process";

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
  const userIds = env("userIds").split(",");
  const a = async () => {
    console.log(new Date());
    for await (const userId of userIds) {
      await main(userId);
    }
  };
  a();
  schedule("*/2 * * * *", async () => {
    await a();
    statusLog();
  });
});

if (!existsSync("id.txt")) {
  writeFileSync("id.txt", "");
}

async function main(userId: string) {
  const data = await getTweets(userId);
  for await (const r of data.result.values()) {
    if (!idCheck(r.id)) {
      await axios.post(env("webhookUrl"), {
        content: `https://fxtwitter.com/status/${r.id}\n${r.createdAt}`,
        avatar_url: data.userIcon,
        username: `${data.userName} (@${data.userScreenName})`,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

async function getTweets(userId: string) {
  const userTweets = await client
    .gql("GET", "UserTweets", {
      userId: userId,
    })
    .catch((e) => {
      execSync("kill 1");
    });
  const userData = await client.gql("GET", "UserByRestId", {
    userId: userId,
  });

  const userIcon: string =
    userData.data.user.result.legacy.profile_image_url_https;
  const userScreenName: string = userData.data.user.result.legacy.screen_name;
  const userName: string = userData.data.user.result.legacy.name;

  const entries =
    userTweets.data.user.result.timeline_v2.timeline.instructions.filter(
      (x: any) => x.type === "TimelineAddEntries"
    )[0].entries;

  const result = entries
    .map((e: any) => {
      return e.content?.itemContent?.tweet_results?.result?.legacy;
    })
    .filter((x: any) => x !== undefined)
    .filter((x: any) => x.user_id_str === userId)
    .map((x: any) => {
      return {
        id: x.id_str,
        text: x.full_text,
        media:
          x.entities?.media?.length > 0
            ? x.entities.media.map((m: any) => m.media_url_https)
            : "",
        createdAt: x.created_at,
      };
    }) as Map<
    string,
    {
      id: string;
      text: string;
      media: string;
      createdAt: string;
    }
  >;
  return {
    result: result,
    userIcon: userIcon,
    userScreenName: userScreenName,
    userName: userName,
  };
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
