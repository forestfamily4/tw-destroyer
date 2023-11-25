import { AxiosResponse } from "axios";
import { Client, Cookie } from "./client";
import chalk from "chalk";
export const login = async (
  email: string,
  username: string,
  password: string,
  proton?: () => string,
) => {
  let client: Client | undefined = new Client(
    {
      email: email,
      username: username,
      password: password,
      guest_token: undefined,
      flow_token: undefined,
    },
    {
      authorization:
        "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
      "content-type": "application/json",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
      "x-twitter-active-user": "yes",
      "x-twitter-client-language": "en",
    },
    true,
  );

  client = await executeLoginFlow(client, proton);
  if (!client || client.cookie.flow_errors == "true") {
    throw new Error(`${chalk.red(`${chalk.bold(username)} login failed`)}`);
  }
  console.log(chalk.green(`${chalk.bold(username)} login success`));
  return client;
};

const updateToken = async (
  client: Client,
  key: keyof Cookie,
  url: string,
  data?: object,
  params?: object,
) => {
  try {
    client.headers["x-guest-token"] = client.cookie.guest_token ?? "";
    client.headers["x-csrf-token"] = client.cookie.ct0 ?? "";
    client.headers["x-twitter-auth-type"] = `OAuth2Client${
      client.cookie.auth_token ?? ""
    }`;

    const res = await client.request("POST", url, params, data);
    const info = res.data;

    const subtasks = info.subtasks as Array<any>;
    subtasks?.forEach((task) => {
      if (task.enter_text?.keyboard_type === "email") {
        console.log(
          chalk.yellow(
            `WARING ${Object.entries(task)
              .filter(([k, v]) => {
                return k === "text";
              })
              .map(([k, v]) => v as string)
              .join(",")}`,
          ),
        );
        client.cookie.confirm_email = "true";
      }
      if (
        task.subtask_id === "LoginAcid" &&
        (task.enter_text.hint_text as string).toLowerCase() ===
          "confirmation code"
      ) {
        console.log(chalk.yellow(`WARING email confirmation code challenge.`));
        client.cookie.confirmation_code = "true";
      }
    });

    client.cookie[key] = info[key];
  } catch (e: any) {
    console.log(chalk.red(`ERROR ${e}`));
    client.cookie.flow_errors = "true";
    console.log(chalk.red("ERROR failed to update token."));
  }
  return client;
};

const initGuestToken = async (client: Client) => {
  return updateToken(
    client,
    "guest_token",
    "https://api.twitter.com/1.1/guest/activate.json",
  );
};

const flowStart = async (client: Client) => {
  return updateToken(
    client,
    "flow_token",
    "https://api.twitter.com/1.1/onboarding/task.json",
    {
      input_flow_data: {
        flow_context: {
          debug_overrides: {},
          start_location: { location: "splash_screen" },
        },
      },
      subtask_versions: {
        action_list: 2,
        alert_dialog: 1,
        app_download_cta: 1,
        check_logged_in_account: 1,
        choice_selection: 3,
        contacts_live_sync_permission_prompt: 0,
        cta: 7,
        email_verification: 2,
        end_flow: 1,
        enter_date: 1,
        enter_email: 2,
        enter_password: 5,
        enter_phone: 2,
        enter_recaptcha: 1,
        enter_text: 5,
        enter_username: 2,
        generic_urt: 3,
        in_app_notification: 1,
        interest_picker: 3,
        js_instrumentation: 1,
        menu_dialog: 1,
        notifications_permission_prompt: 2,
        open_account: 2,
        open_home_timeline: 1,
        open_link: 1,
        phone_verification: 4,
        privacy_options: 1,
        security_key: 3,
        select_avatar: 4,
        select_banner: 2,
        settings_list: 7,
        show_code: 1,
        sign_up: 2,
        sign_up_review: 4,
        tweet_selection_urt: 1,
        update_users: 1,
        upload_media: 1,
        user_recommendations_list: 4,
        user_recommendations_urt: 1,
        wait_spinner: 3,
        web_modal: 1,
      },
    },
    {
      flow_name: "login",
    },
  );
};

const flowInstrumentation = async (client: Client) => {
  return updateToken(
    client,
    "flow_token",
    "https://api.twitter.com/1.1/onboarding/task.json",
    {
      flow_token: client.cookie.flow_token,
      subtask_inputs: [
        {
          subtask_id: "LoginJsInstrumentationSubtask",
          js_instrumentation: {
            response:
              '{"rf":{"aa96d1fd8c6abcf9e46f759cf9dc91b0f31188d989558d4fc129b445524309d2":0,"a7d208e07067af41055df9ecb562945e4c80a39e43425843b1432cf753a9fc4a":1,"a4bf43c544b0699db1e22fbac56aba03ca78d5d1e5c1fd0efc58ca60c40f5262":-1,"acd885c7c3a25b05fa681491e65f59d8c52134145da0454109cf7ed61e4a250b":-2},"s":"9ZeCaG-p-bNeXhz7Hq2TtiCAlsdiqu9eI2Rsz4QSOSfOYT2_hvg_wjrfj1drREldWobwSZRLHcEvhHKC_Q4npeO89v1kP1mVAI6y733XMeuXAjgZARR9KHO-9e6-CkEkqZ_2zdL9qJi1u0MggBRnf4xVj0YM_j-uXzKzF7v_77Tbw33pFTKvrVaj7-YwaADlM1wy_N538l55JTBztFHzW567Uq_Ciq4O9QOt2OzAX00h8FMqJjUhkk8SqESE__EYAH_Z_QOJ-yBRJGEg6hJ4EtuErE5DprkpA_tGDlQQUxh3GGRJCGgOXad-HxOwuX2W1mZnoujM8p6aofV9NStfCwAAAYlJhzR8"}',
            link: "next_link",
          },
        },
      ],
    },
  );
};

const flowUsername = async (client: Client) => {
  return updateToken(
    client,
    "flow_token",
    "https://api.twitter.com/1.1/onboarding/task.json",
    {
      flow_token: client.cookie.flow_token,
      subtask_inputs: [
        {
          subtask_id: "LoginEnterUserIdentifierSSO",
          settings_list: {
            setting_responses: [
              {
                key: "user_identifier",
                response_data: {
                  text_data: { result: client.cookie.username },
                },
              },
            ],
            link: "next_link",
          },
        },
      ],
    },
  );
};

const flowPassword = async (client: Client) => {
  return updateToken(
    client,
    "flow_token",
    "https://api.twitter.com/1.1/onboarding/task.json",
    {
      flow_token: client.cookie.flow_token,
      subtask_inputs: [
        {
          subtask_id: "LoginEnterPassword",
          enter_password: {
            password: client.cookie.password,
            link: "next_link",
          },
        },
      ],
    },
  );
};

const flowDuplicationCheck = async (client: Client) => {
  return updateToken(
    client,
    "flow_token",
    "https://api.twitter.com/1.1/onboarding/task.json",
    {
      flow_token: client.cookie.flow_token,
      subtask_inputs: [
        {
          subtask_id: "AccountDuplicationCheck",
          check_logged_in_account: { link: "AccountDuplicationCheck_false" },
        },
      ],
    },
  );
};

const confirmEmail = async (client: Client) => {
  return updateToken(
    client,
    "flow_token",
    "https://api.twitter.com/1.1/onboarding/task.json",
    {
      flow_token: client.cookie.flow_token,
      subtask_inputs: [
        {
          subtask_id: "LoginAcid",
          enter_text: {
            text: client.cookie.email,
            link: "next_link",
          },
        },
      ],
    },
  );
};

const solveConfirmationChallange = async (
  client: Client,
  proton: () => string,
) => {
  const confirmationCode = proton();
  return updateToken(
    client,
    "flow_token",
    "https://api.twitter.com/1.1/onboarding/task.json",
    {
      flow_token: client.cookie.flow_token,
      subtask_inputs: [
        {
          subtask_id: "LoginAcid",
          enter_text: {
            text: confirmationCode,
            link: "next_link",
          },
        },
      ],
    },
  );
};

const executeLoginFlow = async (client: Client, proton?: () => string) => {
  let client_ = await initGuestToken(client);

  for (const flow of [
    flowStart,
    flowInstrumentation,
    flowUsername,
    flowPassword,
    flowDuplicationCheck,
  ]) {
    client_ = await flow(client_);
  }

  if (client_.cookie.confirm_email === "true") {
    client_ = await confirmEmail(client_);
  }

  if (client_.cookie.confirmation_code === "true") {
    if (!proton) {
      console.log(
        chalk.red(
          "ERROR Please check your email for a confirmation code\nand log in again.",
        ),
      );
      return;
    }
    client_ = await solveConfirmationChallange(client_, proton);
  }
  return client_;
};