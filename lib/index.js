const fs = require('fs')
const nodemon = require("nodemon");
const path = require("path");
const ncp = require('ncp').ncp

const config = require("./config")
const { getFromApp } = require("./utils");
const generator = require("./eleventy");
const script = path.resolve(__dirname, "server.js");

/**
 * Runs the server w/ nodemon for easy development/reloading
 */
const runServer = () => {
  nodemon({
    script: script,
    ext: "js, json",
    ignore: ["node_modules", "app"]
  }).on("quit", () => {
    process.exit(0);
  });
};

/*
 * Copies template folder structure missing from project
 */
const copyFromTemplate = () => {
  const templateDir = path.resolve(__dirname, "template")
  const appDir = getFromApp("app");
  const routesPath = getFromApp("app/routes.js")
  const viewsDir = getFromApp(config.dirs.input)
  const includesDir = getFromApp(config.dirs.includes)
  const dataDir = getFromApp(config.dirs.data)

  if (!fs.existsSync(appDir)) {
    ncp(templateDir, appDir)
  }

  if (!fs.existsSync(routesPath)) {
      const template = path.resolve(templateDir, "routes.js")
      ncp(template, routesPath)
  }

  if (!fs.existsSync(viewsDir)) {
    const template = path.resolve(templateDir, 'views')
    ncp(template, viewsDir)
}

  if (!fs.existsSync(includesDir)) {
    const template = path.resolve(templateDir, 'templates')
    ncp(template, includesDir)
}

  if (!fs.existsSync(dataDir)) {
      const template = path.resolve(templateDir, 'data')
      ncp(template, dataDir)
  }
};

try {
  copyFromTemplate();
  generator.watch();
  runServer();
} catch (err) {
  console.error(err);
}
