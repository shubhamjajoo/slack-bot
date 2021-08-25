const { App } = require("@slack/bolt");
const { Teams } = require("./src/db/models/index");
const debug = require("debug")("slack-bot:server");
const http = require("http");

const app = require("./src/app");

const boltController = require("./src/controllers/boltController");

const authorizeFn = async ({ teamId }) => {
  // Fetch team info from database
  const authorizationRecord = await Teams.findAll({
    where: {
      id: teamId,
    },
  });
  if (authorizationRecord.length) {
    const record = authorizationRecord[0].dataValues;
    return {
      // TODO: get info about the botID
      botToken: record.token,
      botId: "B5910",
      botUserId: record.bot_user_id,
    };
  }

  throw new Error("No matching authorizations");
};

const boltApp = new App({
  authorize: authorizeFn,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

boltApp.message(/^(remote).*/, boltController.processMessage);

boltApp.message(/^(?!.*(remote)).*/, async ({ say }) => {
  await say(
    `Sorry, I did not understand that. You can make use of me by just sending something like \`\`\`I am working remotely from 11 AM to 10 PM\nOR\nI am remote from 10:30 AM - 7:30 PM\nOR\nremote 10am - 8.30pm\`\`\``
  );
});

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
(async () => {
  await boltApp.start(port);
})();

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

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
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug(`Listening on ${bind}`);
}
