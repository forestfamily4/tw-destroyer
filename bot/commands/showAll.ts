import { subscriptionCollection } from "../../lib/db.js"
import { commandHandler } from "../manager/base.js"

export const handler: commandHandler = {
    name: "showall",
    description: "showall",
    aliases: ["showa"],
    authority: "everyone",
    exec(bot, message, args) {
        subscriptionCollection.find({
            // "channelId": message.channel.id,
            "userId": message.author.id,
        }).toArray().then((a) => {
            if (a.length == 0) { 
                message.reply("登録されているユーザーはありません。")
            } else {
                message.reply(`登録されているユーザー: ${a.map((a) => `<#${a.channelId}> https://twitter.com/i/user/${a.twitterUserId}`).join("\n")}`)
            }
        })
    },
}