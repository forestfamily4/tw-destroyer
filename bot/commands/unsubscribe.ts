import { subscriptionCollection } from "../../lib/db";
import { commandHandler } from "../manager/base";

export const handler: commandHandler = {
  name: "unsubscribe",
  description: "登録",
  aliases: ["unsub"],
  authority: "everyone",
  exec: async (_bot, message) => {
    const a = subscriptionCollection.findOne({
      channelId: message.channel.id,
      userId: message.author.id,
    });
    if (!a) {
      message.reply("登録されていません。");
      return;
    }

    await subscriptionCollection.deleteMany({
      userId: message.author.id,
      channelId: message.channel.id,
    });

    message.reply(`削除しました。`);
  },
};
