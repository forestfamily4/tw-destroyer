import { Client, GatewayIntentBits } from "discord.js";
import { Twitter } from '../lib/twitter/twitter';
import { buttonManager } from "./manager/buttons.js";
import { commandManager } from "./manager/commands.js";
import { eventManager } from "./manager/events.js";
import { config } from "./lib/config.js";

export class Bot {
    private commandManager: commandManager
    private eventManager: eventManager
    public client: Client
    private buttonManager: buttonManager
    public twitter: Twitter = new Twitter()

    constructor() {
        this.client = new Client({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
        });


        this.commandManager = new commandManager(this)
        this.eventManager = new eventManager(this)
        this.buttonManager = new buttonManager(this)
    }

    public async reload() {
        await this.commandManager.reload()
        await this.eventManager.reload()
        await this.buttonManager.reload()
        return this
    }

    public async login() {
        await this.reload()
        await this.client.login(config.token)
        await this.twitter.login()
        return this
    }
}