var express = require('express');
var router = express.Router();
const request = require('request');
const { CredentialsManager } = require('../lib/CredentialsManager');

/* GET users listing. */
const credentialsManager = new CredentialsManager();

router.get('/slack/callback',
  (req, res, next) => {
    if (!req.query.code) {
      res.status(500);
      res.send('Looks like we\'re not getting code. ');
    } else {
      request({
        url: 'https://slack.com/api/oauth.v2.access',
        qs: {
          code: req.query.code,
          client_id: process.env.SLACK_CLIENT_ID,
          client_secret: process.env.SLACK_CLIENT_SECRET
        },
        method: 'GET'

      }, async (error, response, body) => {
        if (error) {
          throw error;
        } else {
          const botAccessToken = JSON.parse(body).access_token;
          const bot_user_id = JSON.parse(body).bot_user_id;
          const { team } = JSON.parse(body);
          const extra = {
            bot: {
              accessToken: botAccessToken,
              bot_user_id
            }
          };

          if (botAccessToken) {
            await credentialsManager.setBotAuthorizations(team, extra);
            next();
          } else {
            await credentialsManager.setUserAuthorizations(
              JSON.parse(body).authed_user.access_token, next
            );
          }
        }
      });
    }
  }, (req, res) => {
    res.send('Slack bot installed/updated successfully')
  }
);

module.exports = router;
