const fs = require('fs')
const matter = require('gray-matter')
const path = require('path')

const { getFromApp } = require('../utils')

/**
 * Attempts to match any static HTML file found as a route
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports = (config) => {
  return (req, res, next) => {
    var rPath = req.path;

    // Remove trailing slash, wont work with front matter
    if (rPath.endsWith('/')) {
      rPath = rPath.substr(0, path.length - 1)
    }

    // Remove the leading slash, express render won't work with it
    rPath = rPath.substr(1);

    // If it's blank, render the root index
    if (rPath === "") {
      rPath = "index";
    }

    renderPath(config, rPath, res, next);
  }
}

/**
 * Attempts to load the req.path with its front matter
 * 
 * @param {*} config 
 * @param {*} rPath 
 * @param {*} res 
 * @param {*} next 
 */
const renderPath = (config, rPath, res, next) => {
  // Try to render the path
  const frontMatter = getFrontMatterData(config, rPath)

  res.render(rPath, frontMatter.data, function(error, html) {
    html = matter(html).content

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

    if (!rPath.endsWith("/index")) {
      // Maybe it's a folder - try to render [path]/index.html
      renderPath(rPath + "/index", res, next);
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
 * @param {*} rPath 
 */
const getFrontMatterData = (config, rPath) => {
  const realPath = path.join(config.dirs.views, `${rPath}.html`)
  const appPath = getFromApp(realPath)
  const content = fs.readFileSync(appPath)

  return matter(content)
}
