/*
    Manages the config for Nunjucks, the template engine
 */
const Nunjucks = require("nunjucks")

module.exports = (views, opts) => {
    const defaultOpts = {
        autoescape: true,
        noCache: true,
        watch: true,
    }
    const options = Object.assign(defaultOpts, opts)
    const nunjucks = Nunjucks.configure(views, options)

    return nunjucks
}