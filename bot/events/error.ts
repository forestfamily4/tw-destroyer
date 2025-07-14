import { eventHandler } from "../manager/base";

export const handler: eventHandler<"error"> = {
  name: "error",
  exec(bot, error) {
    console.error(error);
  },
};
