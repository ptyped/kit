/**
 * Properly handles non-existant pages
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

module.exports = (req, res, next) => {
    res.render("404.html", {path: req.path}, (error, html) => {
        console.log(error)
        if (!error) {
          res.set({
            "Content-type": "text/html; charset=utf-8"
          });
          return res.end(html);
        }

        var err = new Error(`Page not found: ${req.path}`)
        err.status = 404
        next(err)
    })
}