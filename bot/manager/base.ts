import { ButtonInteraction, CacheType, Client, ClientEvents, Collection, Interaction, Message } from "discord.js"
import { readdirSync, statSync } from "fs"
import { config } from "../lib/config.js"
import { Bot } from "../bot.js"
export interface handler {
    name: string
    exec: Function

}
export type Authority = "admin" | "everyone"

export interface commandHandler extends handler {
    description: string
    aliases: string[]
    authority: Authority
    exec: (bot: Bot, message: Message, args: string[],) => void | Promise<void>
}

export interface eventHandler<T extends keyof ClientEvents> extends handler {
    name: T,
    exec: (bot: Bot, ...args: ClientEvents[T]) => void | Promise<void>;
}

export interface slashCommandHandler extends handler {
    exec: (interaction: Message, args: string[]) => void | Promise<void>
}

export interface buttonHandler extends handler {
    exec: (bot: Bot, args: Array<any>, interaction: ButtonInteraction<CacheType>) => void | Promise<void>
}

export abstract class baseManager<T extends handler> extends Collection<string, T>{
    constructor(private path: string, readonly client: Client, readonly bot: Bot) {
        super()
        this.setPath()
    }

    abstract load(): void | Promise<void>

    private setPath() {
        const basePath = "bot"
        this.path = `${process.cwd().replaceAll("\\", "/")}/${config.isDev ? "dist" : "src"}/${basePath}/${this.path}`
    }

    private async loadModule() {
        try {
            const a = readdirSync(this.path)
            for (let i = 0; i < a.length; i++) {
                const file = a[i]
                if (!statSync(`${this.path}/${file}`).isFile()) { return }
                const handler: T = (await import(`${this.path}/${file}`)).handler
                if (!handler) {
                    console.log(`Failed to load ${this.constructor.name} ${file}`)
                    continue
                }
                console.log(`Loaded ${this.constructor.name} ${handler.name}`)
                this.set(handler.name, handler)
            }
        } catch (e) {
            console.error(e)
        }
    }

    public async reload() {
        await this.loadModule()
        await this.load()
    }
}


export interface slashCommand {
    name: string
    description: string
    options?: {
        name: string
        description: string
        type: number
        required?: boolean
    }[]
}

export interface slashCommandOption {
    name: string
    description: string
    type: number
    required?: boolean
}

export interface slashCommandOptionType {
    SUB_COMMAND: number
    SUB_COMMAND_GROUP: number
    STRING: number
    INTEGER: number
    BOOLEAN: number
    USER: number
    CHANNEL: number
    ROLE: number
}