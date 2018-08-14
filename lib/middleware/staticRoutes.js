/**
 * Attempts to match any static file found as a route
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports = function(req, res, next) {
  var path = req.path;

  // Remove the first slash, render won't work with it
  path = path.substr(1);

  // If it's blank, render the root index
  if (path === "") {
    path = "index";
  }

  renderPath(path, res, next);
};

function renderPath(path, res, next) {
  // Try to render the path
  res.render(path, function(error, html) {
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
    if (!path.endsWith("/index")) {
      // Maybe it's a folder - try to render [path]/index.html
      renderPath(path + "/index", res, next);
      return;
    }
    // We got template not found both times - call next to trigger the 404 page
    next();
  });
}
