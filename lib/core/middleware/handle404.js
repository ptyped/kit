/**
 * Properly handles non-existant pages
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

module.exports = (req, res, next) => {
    var err = new Error(`Page not found: ${req.path}`)
    err.status = 404
    next(err)
}