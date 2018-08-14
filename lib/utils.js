/*
    Utility functions for the project
*/
const fs = require('fs')
const path = require('path')
const portScanner = require('portscanner')
const prompt = require('prompt')

/**
 * Resolves from app project
 */
module.exports.getFromApp = (relativePath) => {
    const appDir = fs.realpathSync(process.cwd());
    const resolveApp = path.resolve(appDir, relativePath)

    return resolveApp
}

/**
 * Finds available port for server; prompts user if default port is not
 * available
 * 
 * @param {*} app 
 * @param {*} callback 
 */
module.exports.findAvailablePort = (port, callback) => {
  var port = null;

  // When the server starts, we store the port in .port.tmp so it tries to restart
  // on the same port
  try {
    port = Number(fs.readFileSync(path.join(__dirname, "/../.port.tmp")));
  } catch (e) {
    port = Number(process.env.PORT || port);
  }

  console.log("");

  // Check port is free, else offer to change
  portScanner.findAPortNotInUse(port, port + 50, "127.0.0.1", function(
    error,
    availablePort
  ) {
    if (error) {
      throw error;
    }
    if (port === availablePort) {
      // Port is free, return it via the callback
      callback(port);
    } else {
      // Port in use - offer to change to available port
      console.error(
        "ERROR: Port " +
          port +
          " in use - you may have another prototype running.\n"
      );
      // Set up prompt settings
      prompt.colors = false;
      prompt.start();
      prompt.message = "";
      prompt.delimiter = "";

      // Ask user if they want to change port
      prompt.get(
        [
          {
            name: "answer",
            description: "Change to an available port? (y/n)",
            required: true,
            type: "string",
            pattern: /y(es)?|no?/i,
            message: "Please enter y or n"
          }
        ],
        function(err, result) {
          if (err) {
            throw err;
          }
          if (result.answer.match(/y(es)?/i)) {
            // User answers yes
            port = availablePort;
            fs.writeFileSync(path.join(__dirname, "/../.port.tmp"), port);
            console.log("Changed to port " + port);

            callback(port);
          } else {
            // User answers no - exit
            console.log(
              "\nYou can set a new default port in server.js, or by running the server with PORT=XXXX"
            );
            console.log("\nExit by pressing 'ctrl + c'");
            process.exit(0);
          }
        }
      );
    }
  });
};
