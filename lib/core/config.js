const { getFromApp } = require('./utils')
const path = require('path')

const createConfig = () => {
    const defaultConfig ={
        port: 9080,
        dirs: {
            input: "app/views",
            output: "app/generated",
            data: "app/data",
            includes: "app/templates"
        }
    }
    const config = Object.assign(defaultConfig, {})

    config.dirs.views = [
        getFromApp(config.dirs.output),
        path.resolve(__dirname, "views")
    ]

    return config
}

module.exports = createConfig()