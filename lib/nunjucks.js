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

module.exports.server = (app) => {
    Nunjucks.configure(Object.assign(defaultConfig, {
        express: app,
        tags: {
            blockStart: "[[",
            blockEnd: "]]",
            variableStart: "[%",
            variableEnd: "%]",
            commentStart: "[#",
            commentEnd: "#]"
        }
    }))

    return Nunjucks
}