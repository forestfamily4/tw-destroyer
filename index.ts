import { Bot } from "./bot/bot";
import { Server } from "./lib/server";
import { Twitter } from "./lib/twitter/twitter";

async function main() {
  const server=new Server("http://localhost:3000")
  const bot=new Bot()
  await bot.login()
  bot.twitter.startTimer(bot.client)  
} 

main()