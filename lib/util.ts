import dotenv from "dotenv";
dotenv.config();

export const env = (key: string) => {
  return (
    process.env[key] ??
    (() => {
      throw new Error(`${key} is null`);
    })()
  );
};