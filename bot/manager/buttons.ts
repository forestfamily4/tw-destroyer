import { Bot } from "../bot";
import { baseManager, buttonHandler } from "./base";

export class buttonManager extends baseManager<buttonHandler>{
    constructor(bot: Bot) {
        super("buttons", bot.client, bot)
    }

    load(): void {
        this.client.on("interactionCreate", async (interaction) => {
            if (!interaction.isButton()) {
                return
            }
            const args=interaction.customId.split(",")
            const a = this.find(a => a.name == args[0])
            if (!a) {
                return
            }
            
            await a.exec(this.bot, args.slice(1),interaction)
        })
    }
}