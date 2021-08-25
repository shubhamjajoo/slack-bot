const { Authorizations } = require("../db/models/index");
const { CredentialsManager } = require("../lib/CredentialsManager");
const { getUserInfo, updateUserStatus } = require("../api/user");

const { getTimestampInEpoch } = require("../helper/timeUtility");
const { Emoji } = require("../helper/constants");

const credentialsManager = new CredentialsManager();

async function requestAllAuthorization(say) {
  await say(
    `<https://slack.com/oauth/v2/authorize?user_scope=identity.basic&client_id=${process.env.SLACK_CLIENT_ID}|Click here to authorize your identity>`
  );
  await say(
    `<https://slack.com/oauth/v2/authorize?user_scope=users:read&client_id=${process.env.SLACK_CLIENT_ID}|Click here to authorize your identity for clearing status>`
  );
  await say(
    `<https://slack.com/oauth/v2/authorize?user_scope=users.profile:write&client_id=${process.env.SLACK_CLIENT_ID}|Click here to authorize status message update>`
  );
}

exports.processMessage = async ({ message, say, client }) => {
  const { team: team_id, user: userId } = message;
  const team_client = await credentialsManager.getClientByTeamId(team_id);

  if (!team_client) {
    throw new Error("Team not found");
  }

  await say(`Hey there <@${message.user}>!`);
  const userData = await Authorizations.findByPk(userId);

  if (!userData) {
    await requestAllAuthorization(say);
    return;
  }

  const authToken = userData.dataValues.token;

  if (!authToken.length) {
    return;
  }

  const profile = {
    status_text: `Working remotely from 7 to 10`,
    status_emoji: Emoji.HOME,
  };

  try {
    const getUserInfoResponse = await getUserInfo(message.user, {
      token: authToken,
      body: {},
    });

    await client.chat.postMessage({
      channel: process.env.REMOTE_SLACK_CHANNEL_ID,
      token: team_client.dataValues.token,
      text: message.text,
      icon_url: getUserInfoResponse.user.profile.image_24,
      username: getUserInfoResponse.user.profile.real_name,
    });

    const userTimezoneOffset = getUserInfoResponse.user.tz_offset;
    const statusExpiration = getTimestampInEpoch("7", userTimezoneOffset);
    profile.status_expiration = statusExpiration;
  } catch (error) {
    console.log(
      "error while setting status_expiration slack status update",
      error
    );
    say(
      `\nYou may now automate the clearing status message and emoji as per *to* time hereafter.
      Please authorize the link:
      <https://slack.com/oauth/v2/authorize?scope=users:read&client_id=${process.env.SLACK_CLIENT_ID}|Click here to authorize your identity for clearing status>`
    );
  }

  updateUserStatus({
    token: authToken,
    body: {
      profile,
    },
  }).catch(async (err) => {
    if (err.error === "invalid_auth" || err.error === "missing_scope") {
      await say(`You may require to re-authorize to allow the status message and emoji as per *from and to* time hereafter.
      Please re-authorize all the links:`);
      await requestAllAuthorization(say);
    }
  });
};
