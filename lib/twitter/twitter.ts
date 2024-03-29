import {
  TwitterOpenApi,
  TwitterOpenApiClient,
} from "twitter-openapi-typescript";
import { env } from "../util";
import { login } from "./login";
import { subscriptionCollection } from "../db";
import { ActivityType, Client, EmbedBuilder } from "discord.js";

export class Twitter {
  private client: TwitterOpenApiClient | null = null;
  private subscriptions: {
    channelId: string;
    userId: string;
    twitterUserId: string;
  }[] = [];
  private interval = 10 * 60 * 1000;
  private timer: NodeJS.Timeout | null = null;
  constructor() { }
  public async login() {
    return getApiClientFromEmailAndPassword(
      env("email"),
      env("user"),
      env("password"),
      ()=>env("code")
    ).then(client=>{
      this.client=client
    })
  }
  public async getTweets(userid: string) {
    if (this.client === null) { return; }
    const user = await this.getUser(userid)
    if (!user?.user) { return undefined }
    return (await this.client.getTweetApi().getUserTweets({ "userId": user.user.restId, "count": 10 })).data.data
  }
  public async getUser(userid: string) {
    if (this.client === null) {
      return undefined;
    }
    if (userid.match(/^[0-9]+$/) !== null) {
      const data = (await this.client.getUserApi().getUserByRestId({ "userId": userid })).data
      return data
    } else if (userid.match(/^[a-zA-Z0-9_]+$/) !== null) {
      return (await this.client.getUserApi().getUserByScreenName({ "screenName": userid })).data
    }
  }
  public async startTimer(client: Client) {
    this.subscriptions = (await subscriptionCollection.find({}).toArray())
    const exec = async () => {
      console.log("exec")
      this.subscriptions.forEach(async sub => {
        try {
          const tweets = await this.getTweets(sub.twitterUserId)
          const now = new Date()
          tweets?.forEach(async tweet => {
            const time = tweet.tweet.legacy?.createdAt;
            if (!time) { return }
            const date = new Date(time)
            if (now.getTime() - date.getTime() < this.interval) {
              const embed = new EmbedBuilder()
                .setTitle(
                  `${tweet.user?.legacy.name}さんによるツイート (@${tweet.user?.legacy.screenName})`
                )
                .setURL(
                  `https://twitter.com/${tweet.user?.legacy.screenName}/status/${tweet.tweet.legacy?.idStr}`
                )
                .setTimestamp(date)
                .setColor(0x00ffff)
                .setImage(
                  tweet.tweet.legacy?.entities?.media?.[0]?.mediaUrlHttps ?? ""
                )
                .setDescription(tweet.tweet.legacy?.fullText ?? "none")
                .setAuthor({
                  name: tweet.user?.legacy.name ?? "none",
                  url: `https://twitter.com/${tweet.user?.legacy.screenName}`,
                  iconURL: tweet.user?.legacy.profileImageUrlHttps ?? "none",
                });
              const channel = client.channels.cache.get(sub.channelId)
              if (channel?.isTextBased()) {
                channel.send({ embeds: [embed] })
              }
            }
          })

        } catch (e) {
          client.user?.setActivity("X API ERROR", { type: ActivityType.Playing })
        }
      })
      client.user?.setActivity("x!help", { type: ActivityType.Playing })
    }
    exec()
    this.timer = setInterval(exec, this.interval);
  }
  public reloadTimer(client: Client) {
    if (this.timer) {
      clearInterval(this.timer)
    }
    this.startTimer(client);
  }
}

const getApiClientFromEmailAndPassword = async (
  email: string,
  username: string,
  password: string,
  authorization?: () => string
) => {
  const api = new TwitterOpenApi();
  const rclient = await login(email, username, password, authorization);
  return api.getClientFromCookies(
    rclient.cookie
    // rclient.cookie.ct0 ??
    // (() => {
    //   throw new Error("ct0 is null");
    // })(),
    // rclient.cookie.auth_token ??
    // (() => {
    //   throw new Error("auth_token is null");
    // })()
  );
};
