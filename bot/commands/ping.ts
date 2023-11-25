import { commandHandler } from "../manager/base.js"

export const handler: commandHandler = {
    name: "ping",
    description: "ping",
    aliases: ["pong"],
    authority: "everyone",
    exec(bot, message, args) {
        message.reply(`ping: ${Date.now() - message.createdTimestamp}ms\nbotbotは最高にゴミです。`)
    },
}