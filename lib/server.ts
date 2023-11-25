import express from "express";
import axios from "axios";

export class Server {
  private app: express.Express;
  private now: number;
  constructor(private host: string) {
    this.app = express();
    this.now = new Date().getTime();
    this.app.get("/", (req, res) => {
      if (req.query.key === this.now.toString()) {
        this.uptime();
      }
      res.send("ok");
    });

    this.app.listen(3000);
    this.uptime();
  }
  private uptime() {
    setTimeout(async () => {
      const res = await axios.get(this.host, {
        params: {
          key: this.now,
        },
      });
    }, 30 * 1000);
  }
}
