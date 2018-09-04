const { renderStaticPath } = require('../utils');

/**
 * Attempts to match any static HTML file found as a route
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports = config => (req, res, next) => {
  renderStaticPath(config, req.path, res, next);
};
