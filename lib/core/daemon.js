const pm2 = require('pm2')
const path = require('path')

const config = require('./config')
const { getFromApp } = require('./utils')
const pkg = require('../../package.json')
const pkgApp = require(getFromApp('package.json'))
const pkgName = pkgApp ? pkgApp.name : pkg.name

const defaultOpts = {
    name: pkgName,
    script: path.resolve(__dirname, "../cli.js"),
    log: getFromApp(`${pkgName}.log`),
    autorestart: true
}

const connect = () => {
    try {
        return pm2.connect(err => {
            if (err) throw err

            return true
        })
    } catch (err) {
        process.exit(2)
    }
}

const production = (config) => {
    const prodOpts = {}
    const opts = Object.assign(defaultOpts, prodOpts)

    pm2.start(opts)
}

const development = (config) => {
    const devOpts = {
        watch: [
            path.resolve(__dirname, "../"),
            getFromApp(config.dirs.root)
        ]
    }
    const opts = Object.assign(defaultOpts, devOpts)

    pm2.start(opts)
}

module.exports = async (localConfig) => {
    try {
        const appConfig = config(localConfig)

        await connect();

        if (appConfig.env === "production") {
            production(appConfig)
        } else {
            development(appConfig)
        }
    } catch (err) {
        throw err
    }
}