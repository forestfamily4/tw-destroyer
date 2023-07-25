import { Account } from "twitter-api-client-ts";
import dotenv from "dotenv";
import axios from "axios";
import { schedule } from "node-cron";
import { existsSync, readFileSync, writeFileSync } from "fs";
dotenv.config();
const client = new Account(
  env("email"),
  env("usrname"),
  env("password"),
  false
);
client.login().then(() => {
  main(client)
  schedule("* * * * *", () => {
    main(client);
  });
});
if(!existsSync("id.txt")){
  writeFileSync("id.txt", "");
}

async function main(client: Account) {
  const user = await client.gql("GET", "UserTweets", {
    userId: env("userId"),
  });

  const entries =
    user.data.user.result.timeline_v2.timeline.instructions.filter(
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

  console.log(result);

  for await (const r of result) {
    if (!idCheck(r.id)) {
      await axios.post(
        env("webhookUrl"),
        {
          content: `https://fxtwitter.com/elonmusk/status/${r.id}`,
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
