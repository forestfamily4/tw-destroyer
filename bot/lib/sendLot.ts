import { TextChannel } from "discord.js";

export const sendLot =async (channel: TextChannel, text: string) => {
    const arr:Array<string> = [];

    for (let i = 0; i < text.length; i += 1900) {
        arr.push(text.substring(i, i + 1900));
    }

    arr.forEach(async(text) => {
        await channel.send(text);
    })
}