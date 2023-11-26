import { Client } from "discord.js"
import { eventHandler } from "../manager/base.js"

export const handler: eventHandler<"ready"> = {
    name: "ready",
    exec: async (bot, client) => {
      client.user.setActivity('x!help', { type: 'WATCHING' })
        console.log(`ready as ${client.user?.tag}`)
    }
}