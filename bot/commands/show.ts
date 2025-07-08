import { subscriptionCollection } from "../../lib/db.js"
import { commandHandler } from "../manager/base.js"

export const handler: commandHandler = {
    name: "show",
    description: "show",
    aliases: [""],
    authority: "everyone",
    exec(bot, message, args) {
        subscriptionCollection.find({
            // "channelId": message.channel.id,
            "userId": message.author.id,
        }).toArray().then((a) => {
            message.reply(`登録されているユーザー: ${a.map((a) => `<#${a.channelId}> https://twitter.com/i/user/${a.twitterUserId}`).join("\n")}`)
        })
    },
}