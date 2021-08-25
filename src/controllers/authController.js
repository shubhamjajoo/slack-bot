const axios = require("axios");
const { CredentialsManager } = require("../lib/CredentialsManager");

const credentialsManager = new CredentialsManager();

exports.validatePayload = (req, _res, next) => {
  if (!req.query.code) {
    throw new Error("Looks like we're not getting code.");
  }
  next();
};

exports.setupBot = async (req, res, next) => {
  const params = new URLSearchParams();
  params.append("code", req.query.code);
  params.append("client_id", process.env.SLACK_CLIENT_ID);
  params.append("client_secret", process.env.SLACK_CLIENT_SECRET);

  const { data } = await axios.post(
    "https://slack.com/api/oauth.v2.access",
    params
  );

  if (data.error) {
    throw new Error(JSON.stringify(data));
  }

  res.locals.data = data;
  next();
};

exports.setAuthorization = async (_req, res, next) => {
  const data = res.locals.data;

  const botAccessToken = data.access_token;
  const bot_user_id = data.bot_user_id;

  const extra = {
    bot: {
      accessToken: botAccessToken,
      bot_user_id,
    },
  };

  try {
    if (botAccessToken) {
      await credentialsManager.setBotAuthorizations(data.team, extra);
    } else {
      await credentialsManager.setUserAuthorizations(
        data.authed_user.access_token
      );
    }
    next();
  } catch (err) {
    throw new Error(err);
  }
};

exports.slackInstalledSuccess = (_req, res) => {
  res.send("Slack bot installed/updated successfully");
};
