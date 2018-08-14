const fs = require("fs");
const nodemon = require("nodemon");
const path = require("path");
const ncp = require("ncp").ncp;

const config = require("./config");
const { getFromApp } = require("./utils");
const generator = require("./eleventy");
const script = path.resolve(__dirname, "server.js");

/**
 * Runs the server w/ nodemon for easy development/reloading
 */
module.exports.runServer = () => {
  nodemon({
    script: script,
    ext: "js, json",
    watch: [process.cwd(), __dirname],
    ignore: ["node_modules", "app/views", "app/templates"]
  }).on("quit", () => {
    process.exit(0);
  });
};

/*
 * Copies template folder structure missing from project
 */
module.exports.copyFromTemplate = async () => new Promise(async (resolve, reject) => {
    const templateDir = path.resolve(__dirname, "template");
    const appDir = getFromApp("app");
    const routesPath = getFromApp("app/routes.js");
    const viewsDir = getFromApp(config.dirs.input);
    const includesDir = getFromApp(config.dirs.includes);
    const dataDir = getFromApp(config.dirs.data);
  
    if (!fs.existsSync(appDir)) {
      await ncp(templateDir, appDir);
    }
  
    if (!fs.existsSync(routesPath)) {
      const template = path.resolve(templateDir, "routes.js");
      await ncp(template, routesPath);
    }
  
    if (!fs.existsSync(viewsDir)) {
      const template = path.resolve(templateDir, "views");
      await ncp(template, viewsDir);
    }
  
    if (!fs.existsSync(includesDir)) {
      const template = path.resolve(templateDir, "templates");
      await ncp(template, includesDir);
    }
  
    if (!fs.existsSync(dataDir)) {
      const template = path.resolve(templateDir, "data");
      await ncp(template, dataDir);
    }

    resolve()
})
  
module.exports.run = async () => {
  try {
    await module.exports.copyFromTemplate();
    await generator.watch();
    await module.exports.runServer();
  } catch (err) {
    console.error(err);
  }
};

if (require.main === module) {
    module.exports.run();
}
