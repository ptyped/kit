/**
 * Removes .html & .htm extensions from requests
 * 
 * @param {*} req 
 * @param {*} res 
 */

module.exports = (req, res) => {
  var path = req.path;
  var parts = path.split(".");
  parts.pop();
  path = parts.join(".");
  res.redirect(path);
};
