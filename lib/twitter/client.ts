import axios, { AxiosError, AxiosResponse } from "axios";
import chalk from "chalk";

export class Client {
  public initWithCookies: boolean = true;
  public followRedirects: boolean = false;
  public cookie: Partial<Cookie>;
  constructor(
    cookie: Partial<Cookie> | string,
    public headers: Partial<Headers>,
    public follow_redirects: boolean,
  ) {
    if (typeof cookie === "string") {
      this.cookie = this.parseCookie(cookie);
    }
    else {
      this.cookie = cookie;
    }
  }
  public async request(
    method: "POST" | "GET",
    url: string,
    params?: object,
    data?: any,
  ) {
    await this.getHeaders();

    if (method == "POST") {
      return new Promise<any>((resolve, reject) => {
        axios
          .post(url, data, {
            headers: this.headers,
            params: params,
            maxRedirects: this.followRedirects ? 0 : 5,
            withCredentials: true,
          })
          .then((res) => {
            this.setCookie(res);
            resolve(res);
          })
          .catch((err) => {
            reject(err);
            const ee = err as AxiosError;
            console.log(chalk.red(JSON.stringify(ee?.response?.data)));            
          });
      });
    } else {
      return new Promise<any>((resolve, reject) => {
        axios
          .get(url, {
            headers: this.headers,
            params: params,
            maxRedirects: this.followRedirects ? 0 : 5,
            withCredentials: true,
          })
          .then((res) => {
            this.setCookie(res);
            resolve(res);
          })
          .catch((err) => {
            reject(err);
            const ee = err as AxiosError;
            console.log(chalk.red(JSON.stringify(ee?.response?.data)));
          });
      });
    }
  }

  private setCookie(res?: AxiosResponse<any, any>) {
    res?.headers["set-cookie"]?.forEach((cookie: string) => {
      const [key, value] = cookie.split(";")[0].split("=");
      const key2 = key.trim() as keyof Cookie;
      if (key2 === undefined) return;
      this.cookie[key2] = value ?? "";
    });
  }

  public async getHeaders() {
    this.headers.cookie = this.cookieToString();
    this.headers["x-csrf-token"] = this.cookie.ct0 ?? "";
    this.headers["x-guest-token"] = this.cookie.guest_token ?? "";
  }

  private cookieToString() {
    return Object.entries(this.cookie)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
  }

  private parseCookie(data: string) {
    const cookie: Partial<Cookie> = {};
    data.split(";").forEach((cookieString) => {
      const [key, value] = cookieString.split("=");
      cookie[key.trim() as keyof Cookie] = value;
    });
    return cookie;
  }
}

export interface Cookie {
  email: string;
  username: string;
  password: string;
  guest_token: string;
  flow_token: string;
  flow_errors: string;
  ct0: string;
  auth_token: string;
  confirm_email: string;
  confirmation_code: string;
  twid: string;
  guest_id_marketing: string;
  "Max-Age": string;
  Expires: string;
  Path: string;
  Domain: string;
  SameSite: string;
  guest_id_ads: string;
  personalization_id: string;
  guest_id: string;
  att: string;
}

export interface Headers {
  authorization: string;
  cookie: string;
  "content-type": string;
  "user-agent": string;
  "x-twitter-active-user": string;
  "x-twitter-client-language": string;
  "x-guest-token": string;
  "x-twitter-auth-type": string;
  referer: string;
  "x-csrf-token": string;
}