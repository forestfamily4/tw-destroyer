import { subscriptionCollection } from "../../lib/db.js";
import { commandHandler } from "../manager/base.js";

export const handler: commandHandler = {
  name: "show",
  description: "show",
  aliases: [""],
  authority: "everyone",
  exec(_bot, message) {
    subscriptionCollection
      .find({
        channelId: message.channel.id,
        userId: message.author.id,
      })
      .toArray()
      .then((a) => {
        if (a.length == 0) {
          message.reply(
            "このチャンネル内に登録されているユーザーはありません。あなたの登録したユーザーを全て表示するには、`showall` コマンドを使用してください。",
          );
        } else {
          message.reply(
            `登録されているユーザー: ${a.map((a) => `<#${a.channelId}> https://twitter.com/i/user/${a.twitterUserId}`).join("\n")}\n\nこのチャンネル外にてあなたが登録したユーザーを全て表示するには、\`showall\` コマンドを使用してください。`,
          );
        }
      });
  },
};
