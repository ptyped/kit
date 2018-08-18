const path = require('path')

const { getFromApp } = require('./utils')

module.exports = (config) => {
    const defaultConfig ={
        port: 9080,
        env: process.env.NODE_ENV,
        dirs: {
            input: "app",
            output: "dist",
            views: "views",
            data: "data",
            templates: "templates"
        }
    }
    const appConfig = Object.assign(defaultConfig, config)

    Object.keys(appConfig.dirs).forEach(key => {
        const val = appConfig.dirs[key]
        let appVal = val

        if (key === "input" || key === "output") {
            appVal = getFromApp(val)
        } else {
            const pathFromRoot = path.resolve(appConfig.dirs.input, val)
            appVal = getFromApp(pathFromRoot)
        }

        appConfig.dirs[key] = appVal
    })

    return appConfig
}