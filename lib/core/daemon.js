const pm2 = require('pm2')
const path = require('path')

const config = require('./config')
const { getFromApp } = require('./utils')

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
    // TODO: fix watching
    const prodOpts = {
        watch: [
        ]
    }
    const opts = Object.assign(defaultOpts, prodOpts)

    try {
        pm2.start(opts, startHandler)
    } catch (err) {
        process.exit(2)
    }
}

const development = (config) => {
    // TODO: fix watching
    const devOpts = {
        watch: [
        ]
    }
    const opts = Object.assign(defaultOpts, devOpts)

    try {
        pm2.start(opts, startHandler)       
    } catch (err) {
        process.exit(2)
    }
}

module.exports.start = async (localConfig, name) => {
    const defaultOpts = {
        name: name,
        script: path.resolve(__dirname, "../server.js"),
        args: ['start'],
        log: getFromApp(`${name}.log`),
        autorestart: true
    }

    try {
        const appConfig = await config(localConfig)

        await connect();

        if (appConfig.get('env') === "production") {
            production(appConfig)
        } else {
            development(appConfig)
        }
    } catch (err) {
        throw err
    }
}

module.exports.stop = (localConfig, name) => {
    try {
        pm2.stop(name, err => {
            if (err) throw err

            process.exit(0)
        })
    } catch (err) {
        throw err
    }
}