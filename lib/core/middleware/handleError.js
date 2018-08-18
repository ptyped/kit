/**
 * Properly catch and handle all erros
 * 
 * @param {*} err 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

module.exports = (err, req, res, next) => {
    console.error(err.message)
    res.status(err.status || 500)
    res.send(err.message)
}