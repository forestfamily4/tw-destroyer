import { commandHandler } from "../manager/base.js";

export const handler: commandHandler = {
  name: "ping",
  description: "ping",
  aliases: ["pong"],
  authority: "everyone",
  exec(_bot, message) {
    message.reply(`ping: ${Date.now() - message.createdTimestamp}ms`);
  },
};
