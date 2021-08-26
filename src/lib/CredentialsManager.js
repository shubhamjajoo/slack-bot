const { Teams, User, Authorizations } = require("../db/models/index");
import getTeamDetails from "../api/getTeamDetails";
import { getUserIdentity } from "../api/user";

function extractParams(params) {
  const { real_name, email } = params.profile;
  const user_name = params.name;
  const image_url = params.profile.image_192;
  const time_zone = params.tz;
  const { id, team_id } = params;
  return {
    real_name,
    email,
    user_name,
    image_url,
    time_zone,
    id,
    team_id,
  };
}

class CredentialsManager {
  constructor() {
    this.scope = [
      "identity.basic",
      "identity.email",
      "identity.team",
      "identity.avatar",
      "chat:write:user",
      "users.profile:read",
      "users.profile:write",
      "reactions:read",
      "users:read",
    ];

    this.botAuthorizations = null;
    this.clients = {};
  }

  getScope() {
    return this.scope;
  }

  getBotAuthorizations() {
    return this.botAuthorizations;
  }

  async setBotAuthorizations(team, extra) {
    return new Promise(async (resolve, reject) => {
      const authorizationRecord = await Teams.findOrCreate({
        where: {
          id: team.id,
          token: extra.bot.accessToken,
          bot_user_id: extra.bot.bot_user_id,
        },
      });
      if (authorizationRecord) {
        this.botAuthorizations = authorizationRecord[0];
        try {
          const teams = await Teams.findAll();

          teams.forEach(async (team) => {
            const teamResponse = await getTeamDetails(team.token);
            const userList = teamResponse.data.members;

            // Iterate over each user
            userList.forEach(async (user) => {
              const { id } = user;

              // Find if the user is already present, if not then create User
              const userRecord = await User.findAll({
                where: {
                  id: id,
                },
              });

              if (!userRecord.length) {
                const {
                  real_name,
                  email,
                  user_name,
                  image_url,
                  time_zone,
                  id,
                  team_id,
                } = extractParams(user);
                await User.create({
                  user_name,
                  image_url,
                  real_name,
                  email,
                  time_zone,
                  team_id,
                  id,
                });
              } else {
                await slackBotEventManager.updateUserEvent(userRecord, user);
              }
            });
          });
          resolve();
        } catch (error) {
          console.error(error);
          reject(error);
        }
        resolve();
      } else {
        reject();
      }
    });
  }

  async setUserAuthorizations(token) {
    return new Promise(async (resolve, reject) => {
      try {
        const { data: userResponse } = await getUserIdentity(token);

        const userId = userResponse.user.id;

        const authData = await Authorizations.findByPk(userId);

        if (authData === null) {
          await Authorizations.create({
            id: userId,
            token,
          });
        } else {
          await authData.update({ token });
        }
        resolve();
      } catch (err) {
        reject(JSON.stringify(err));
      }
    });
  }

  async getClientByTeamId(teamId) {
    return await Teams.findOne({
      where: {
        id: teamId,
      },
    });
  }

  installSlackBotCallback(req, res) {
    res.send(`<p>Remote slackbot is installed / updated successfully</p>`);
  }

  installationFailureCallback(err, req, res, next) {
    res
      .status(500)
      .send(
        `<p>Something went wrong while installing / updating Remote slack bot</p> <pre>${err}</pre>`
      );
  }
}
module.exports = { CredentialsManager };
