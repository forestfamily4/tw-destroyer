import { subscriptionCollection } from '../../lib/db';
import { parse } from "dotenv";
import { commandHandler } from "../manager/base";

export const handler: commandHandler = {
    "name": "unsubscribe",
    "description": "登録",
    "aliases": ["unsub"],
    "authority": "everyone",
    "exec": async(bot, message, args) => {
        const a=subscriptionCollection.findOne({
            "channelId":message.channel.id,
            "userId": message.author.id,
        })
        if(!a){
            message.reply("登録されていません。")
            return
        }

        await subscriptionCollection.deleteMany({
            "userId": message.author.id,
            "channelId": message.channel.id,
        })
        
        message.reply(`削除しました。`)
    }
}