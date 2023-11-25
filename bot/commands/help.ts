import { commandHandler } from "../manager/base.js"

export const handler: commandHandler = {
    name: "help",
    description: "help",
    aliases: [""],
    authority: "everyone",
    exec(bot, message, args) {
        const content=`
        コマンド一覧
        \`ping\`: pong
        \`subscribe [ユーザー名/ID]\`: 送信したチャンネルでユーザーのツイートを監視します。(alias: sub)
        \`unsubscribe\`: 送信したチャンネルでユーザーのツイートの監視をやめます。(alias: unsub)
        \`show\`: 送信したチャンネルで監視しているユーザーを表示します。
        `
        message.reply(content)
    },
}