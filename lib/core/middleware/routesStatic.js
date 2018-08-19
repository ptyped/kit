const matter = require('gray-matter')

const { renderPathWithFrontMatter } = require('../utils')

/**
 * Attempts to match any static HTML file found as a route
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports = (config) => {
  return (req, res, next) => {
    renderPathWithFrontMatter(config, req.path, res, next);
  }
}
