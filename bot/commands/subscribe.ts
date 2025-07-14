import { subscriptionCollection } from "./../../lib/db";
import { commandHandler } from "../manager/base";

export const handler: commandHandler = {
  name: "subscribe",
  description: "登録",
  aliases: ["sub"],
  authority: "everyone",
  exec: async (bot, message, args) => {
    if (args.length < 1) {
      message.reply("引数が足りません。");
      return;
    }
    if (
      (await subscriptionCollection.countDocuments({
        userId: message.author.id,
      })) > 3
    ) {
      message.reply("登録数が上限に達しています。");
      return;
    }
    const id = args[0];
    const user = await bot.twitter.getUser(id);
    const twitterUserId = user?.user?.restId;
    if (!user || !twitterUserId) {
      message.reply("ユーザーが見つかりませんでした。");
      return;
    }
    if (
      (await subscriptionCollection.countDocuments({
        channelId: message.channel.id,
        userId: message.author.id,
        twitterUserId: twitterUserId,
      })) > 0
    ) {
      message.reply("このチャンネル内に既に登録されています。");
      return;
    }
    await subscriptionCollection.insertOne({
      channelId: message.channel.id,
      userId: message.author.id,
      twitterUserId: twitterUserId,
    });
    message.reply(`登録しました。${twitterUserId}`);
  },
};
