import { eventHandler } from "../manager/base";

export const handler: eventHandler<"messageCreate"> = {
  name: "messageCreate",
  exec: async (bot, message) => {
    if(message.mentions.has(bot.client.user??"")) {
      message.reply("twitterぼっとです。")
    }
  }
}