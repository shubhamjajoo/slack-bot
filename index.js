#!/usr/bin/env node

/**
 * Module dependencies.
 */
const { App } = require('@slack/bolt');
var { Teams, Authorizations } = require('./src/db/models/index');
var debug = require('debug')('slack-bot:server');
var http = require('http');

const { CredentialsManager } = require('./src/lib/CredentialsManager');
const { getUserInfo, updateUserStatus } = require('./src/api/user');
var app = require('./src/app.js');

const credentialsManager = new CredentialsManager()

const getTimestampInEpoch = (inputTime, userTimezoneOffsetInSeconds = 0) => {
  const is12Hourformat = inputTime.toLowerCase().includes('pm');
  const time = inputTime.split(/am|pm/i)[0];

  let [hour, minute] = time.split(/[:,.]/);

  const isNoon = hour === '12' && inputTime.toLowerCase().includes('pm');
  const isMidnight = hour === '12' && inputTime.toLowerCase().includes('am');

  hour = (is12Hourformat && !isNoon) || isMidnight ? 12 + Number(hour) : Number(hour);
  hour = hour.length === 1 ? Number(`0${hour}`) : hour;

  minute = Number(minute || '00');

  const newDate = new Date();
  const serverOffset = newDate.getTimezoneOffset() * 60;
  const hasOffsetDifference = userTimezoneOffsetInSeconds + serverOffset;
  let epochTime = Math.floor(newDate.setHours(hour, minute, 0) / 1000);

  if (userTimezoneOffsetInSeconds && hasOffsetDifference) {
    epochTime -= userTimezoneOffsetInSeconds;
  }

  return epochTime;
};

const authorizeFn = async ({ teamId, enterpriseId }) => {
  // Fetch team info from database
  const authorizationRecord = await Teams.findAll({
    where: {
      id: teamId,
    }
  });
  if (authorizationRecord.length) {
    const record = authorizationRecord[0].dataValues;
    return {
      // TODO: get info about the botID
      botToken: record.token,
      botId: 'B5910',
      botUserId: record.bot_user_id,
    };
  }

  throw new Error('No matching authorizations');
}

const boltApp = new App({
  authorize: authorizeFn,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

boltApp.message('hello', async ({ message, say, client }) => {
  const { team: team_id, user: userId } = message;
  const team_client = await credentialsManager.getClientByTeamId(team_id);
  if (team_client) {
    await say(`Hey there <@${message.user}>!`)
    const userData = await Authorizations.findByPk(userId)
    if (!userData) {
      await say(` <https://slack.com/oauth/v2/authorize?user_scope=identity.basic&client_id=${process.env.SLACK_CLIENT_ID}|Click here to authorize your identity>`)
      await say(` <https://slack.com/oauth/v2/authorize?user_scope=users:read&client_id=${process.env.SLACK_CLIENT_ID}|Click here to authorize your identity for clearing status>`)
      await say(` <https://slack.com/oauth/v2/authorize?user_scope=users.profile:write&client_id=${process.env.SLACK_CLIENT_ID}|Click here to authorize status message update>`)
    } else {
      const authToken = userData.dataValues.token;
      if (authToken.length) {
        const profile = {
          status_text: `Working remotely from 7 to 10`,
          status_emoji: ':house_with_garden:'
        };
        try {
          const getUserInfoResponse = await getUserInfo(message.user, { token: authToken, body: {} });
          await client.chat.postMessage({
            channel: process.env.REMOTE_SLACK_CHANNEL_ID,
            token: team_client.dataValues.token,
            text: message.text,
            icon_url: getUserInfoResponse.user.profile.image_24,
            username: getUserInfoResponse.user.profile.real_name
          });
          const userTimezoneOffset = getUserInfoResponse.user.tz_offset;
          const statusExpiration = getTimestampInEpoch("7", userTimezoneOffset);
          profile.status_expiration = statusExpiration;
        } catch (error) {
          console.log('error while setting status_expiration slack status update', error);
          // This authorization is required to get the user timezone related information from https://api.slack.com/methods/users.info
          say(`\nYou may now automate the clearing status message and emoji as per *to* time hereafter.
          Please authorize the link:
              <https://slack.com/oauth/authorize?scope=users:read&client_id=${process.env.SLACK_CLIENT_ID}|Click here to authorize your identity for clearing status>`)
        }
        updateUserStatus(
          {
            token: authToken,
            body: {
              profile
            }
          }
        ).catch(async (err) => {
          if (err.error === 'invalid_auth' || err.error === 'missing_scope') {
            await say(`You may require to re-authorize to allow the status message and emoji as per *from and to* time hereafter.
            Please re-authorize all the links:`);
            await say(` < https://slack.com/oauth/v2/authorize?user_scope=identity.basic&client_id=${process.env.SLACK_CLIENT_ID}|Click here to authorize your identity>`)
            await say(` <https://slack.com/oauth/v2/authorize?user_scope=users:read&client_id=${process.env.SLACK_CLIENT_ID}|Click here to authorize your identity for clearing status>`)
            await say(` <https://slack.com/oauth/v2/authorize?user_scope=users.profile:write&client_id=${process.env.SLACK_CLIENT_ID}|Click here to authorize status message update>`)
          }
        });

      }
    }
  } else {
    throw new Error('Team not found');
  }
});


/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
(async () => {
  await boltApp.start(port);
})();
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
