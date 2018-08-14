/**
 * Removes .html & .htm extensions from requests
 * 
 * @param {*} req 
 * @param {*} res 
 */

module.exports = (req, res) => {
  var path = req.path;
  var parts = path.split(".");

  if (path.indexOf('index.html') > 0) {
    path = path.replace('index.html', '')
    res.redirect(path);
  } else {
    parts.pop();
    path = parts.join(".");

    res.redirect(path);
  }
};
