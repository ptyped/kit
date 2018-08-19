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
    args: ['start'],
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

const startHandler = (err, apps) => {
    if (err) throw err

    apps.forEach(app => {
        console.log(`Successfully started ${app.name}`)
    })
    process.exit(0)
}

const production = (config) => {
    const prodOpts = {}
    const opts = Object.assign(defaultOpts, prodOpts)

    try {
        pm2.start(opts, startHandler)
    } catch (err) {
        process.exit(2)
    }
}

const development = (config) => {
    const devOpts = {
        watch: [
            path.resolve(__dirname, "../"),
            getFromApp(config.dirs.input)
        ]
    }
    const opts = Object.assign(defaultOpts, devOpts)

    try {
        pm2.start(opts, startHandler)       
    } catch (err) {
        process.exit(2)
    }
}

module.exports.start = async (localConfig) => {
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

module.exports.stop = () => {
    try {
        pm2.stop(pkgName, err => {
            if (err) throw err

            process.exit(0)
        })
    } catch (err) {
        throw err
    }
}