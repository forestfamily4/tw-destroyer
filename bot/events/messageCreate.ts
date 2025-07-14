import { eventHandler } from "../manager/base";

export const handler: eventHandler<"messageCreate"> = {
  name: "messageCreate",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  exec: async (bot, message) => {},
};
