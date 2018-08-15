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
    Nunjucks.configure({
        watch: false,
    })

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