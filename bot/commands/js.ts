import { Lang, LangFormat, runCode } from "../lib/langRunner.js";
import { commandHandler } from "../manager/base.js"
import { AttachmentBuilder } from "discord.js";

export const handler: commandHandler = {
  name: "js",
  description: "js",
  aliases: [],
  authority: "admin",
  async exec(bot, message, args) {
    try {
      const code = args.join(" ");
      const result = await runCode(code.trim(), Lang.JS, message, bot);
      if (result.length > 2000) {
        await message.channel.send({
          files: [
            new AttachmentBuilder(Buffer.from(result), {
              name: `out.${LangFormat[Lang.JS]}`,
            }),
          ],
        });
        return;
      }
      await message.channel.send(`\`\`\`${LangFormat[Lang.JS]}\n${result}\n\`\`\``);
      return;
    } catch  {
      message.reply(`Error`);
    }
  },
}