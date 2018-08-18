/*
    Manages the config for Nunjucks, the template engine
 */
const Nunjucks = require("nunjucks")

const defaultConfig = {
    autoescape: true,
    noCache: true,
    watch: true,
}

module.exports.static = () => {
    const opts = Object.assign(defaultConfig, {
        watch: false,
    })

    Nunjucks.configure(opts)

    return Nunjucks
}

module.exports.server = (views, app) => {
    const opts = Object.assign(defaultConfig, {
        express: app,
        tags: {
            blockStart: '[%',
            blockEnd: '%]',
            variableStart: '[[',
            variableEnd: ']]',
            commentStart: '{#',
            commentEnd: '#}'
        }
    })

    Nunjucks.configure(views, opts)

    return Nunjucks
}