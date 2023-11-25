import { Client } from "discord.js";
import { baseManager, commandHandler } from "./base.js";
import { config } from "../lib/config.js";
import { Bot } from "../bot.js";


export class commandManager extends baseManager<commandHandler>{
    constructor(bot: Bot) {
        super("commands", bot.client, bot)
    }

    load(): void {        
        this.client.on("messageCreate", (message) => {
            const args = message.content.split(/ |　/)
            let command = args.shift() ?? ""

            if (!command.startsWith(config.prefix)) {
                return
            }
            command = command.slice(config.prefix.length)
            const a=this.find(a => a.aliases.includes(command) || a.name == command)
            if(message.guild?.id=="852470347907334204"){
                return a?.exec(this.bot, message, args)                
            }
            if(a?.authority=="admin" && !config.owner.includes(message.author.id)){
                return
            }            
            a?.exec(this.bot, message, args)                
        })
    }
}
