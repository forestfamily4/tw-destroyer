import { Account } from "twitter-api-client-ts";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();
main();
async function main() {
  const client = new Account(env("email"), env("usrname"), env("password"),false);
  await client.login();

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
    .map((x:any)=> {return {
      id: x.id_str,
      text: x.full_text,
      media: x.entities.media.map((m:any)=>m.media_url_https)
    }})

    console.log(result)
}



function env(s: string) {
  const k = process.env[s];
  if (!k) {
    throw new Error(`env ${s} is not defined`);
  }
  return k;
}
