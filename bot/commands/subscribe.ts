import { subscriptionCollection } from './../../lib/db';
import { parse } from "dotenv";
import { commandHandler } from "../manager/base";

export const handler: commandHandler = {
    "name": "subscribe",
    "description": "登録",
    "aliases": ["sub"],
    "authority": "everyone",
    "exec": async(bot, message, args) => {
        if (args.length < 1) {
            message.reply("引数が足りません。")
            return
        }
        if(await subscriptionCollection.countDocuments({
            "userId": message.author.id
        })>3){
            message.reply("登録数が上限に達しています。")
            return
        }
        const id = args[0]
        const user=await bot.twitter.getUser(id)
        if(!user){
            message.reply("ユーザーが見つかりませんでした。")
            return
        }
        await subscriptionCollection.insertOne({
            "channelId": message.channel.id,            
            "userId": message.author.id,
            "twitterUserId": user?.user?.restId??""
        })
        bot.twitter.reloadTimer(bot.client)
        message.reply(`登録しました。${user.user?.restId}`)
    }
}