/*
    Utility functions for the project
*/
const fs = require("fs");
const glob = require("glob");
const matter = require('gray-matter')
const ncp = require("ncp").ncp;
const path = require("path");
const portScanner = require("portscanner");
const prompt = require("prompt");

/**
 * Resolves from app project
 */
module.exports.getFromApp = relativePath => {
  const appDir = path.resolve(fs.realpathSync(process.cwd()));
  const resolveApp = path.resolve(appDir, relativePath);

  return resolveApp;
};

/**
 * Finds available port for server; prompts user if default port is not
 * available
 *
 * @param {*} app
 * @param {*} callback
 */
module.exports.findAvailablePort = (port, callback) => {
  // When the server starts, we store the port in .port.tmp so it tries to restart
  // on the same port
  try {
    port = Number(fs.readFileSync(path.resolve(process.cwd(), ".port.tmp")));
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
            fs.writeFileSync(path.resolve(process.cwd(), ".port.tmp"), port);
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

/*
 * Copies template folder structure missing from project
 */
module.exports.copyFromTemplate = async (config, template) =>
  new Promise(async (resolve, reject) => {
    const templatePath = template ? template : path.resolve(__dirname, "../template")
    const templateFiles = glob.sync(templatePath + "/**/*");
    const appDir = module.exports.getFromApp("app");

    if (!fs.existsSync(appDir)) {
      await ncp(templatePath, appDir)
    } else {
      templateFiles.forEach(file => {
        const filePath = file.slice(templatePath.length + 1)
        const appPath = path.resolve(config.dirs.input, filePath)

        if (!fs.existsSync(appPath)) {
          ncp(file, appPath)
        }
      })
    }

    return resolve();
  });

/**
 * Attempts to load the req.path with its front matter
 * 
 * @param {*} config 
 * @param {*} reqPath 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.renderPathWithFrontMatter = (config, reqPath, res, next) => {
  // Remove the leading slash, res.render won't work with it
  if (reqPath.startsWith('/')) {
    reqPath = reqPath.substr(1);
  }

  // Remove the trailing slash, as frontmatter won't work with it
  if (reqPath.endsWith('/')) {
    reqPath = reqPath.substr(0, reqPath.length - 1);
  }

  // If it's blank, render the root index
  if (reqPath === "") {
    reqPath = "index";
  }

  const data = module.exports.getFrontMatterData(config, reqPath).data

  res.render(reqPath, data, (error, html) => {
    if (html) {
      html = matter(html).content
    }

    if (!error) {
      // Success - send the response
      res.set({ "Content-type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    if (!error.message.startsWith("template not found")) {
      // We got an error other than template not found - call next with the error
      next(error);
      return;
    }

    if (!reqPath.endsWith("/index")) {
      // Maybe it's a folder - try to render [path]/index.html
      module.exports.renderPathWithFrontMatter(config, reqPath + "/index", res, next);
      return;
    }
    // We got template not found both times - call next to trigger the 404 page
    next();
  });
}

/**
 * Retrieves front matter data from a req.path
 * 
 * @param {*} config 
 * @param {*} reqPath 
 */
module.exports.getFrontMatterData = (config, reqPath) => {
  let content = ""
  
  const realPath = path.join(config.dirs.views, `${reqPath}.html`)
  const appPath = module.exports.getFromApp(realPath)

  if (fs.existsSync(appPath)) {
    fileContent = fs.readFileSync(appPath)
    content = matter(fileContent)
  }

  return content
}