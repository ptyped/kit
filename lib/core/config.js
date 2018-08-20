const convict = require('convict')
const path = require('path')

const { getFromApp } = require('./utils')
const schema = convict({
    env: {
        doc: "The application's environment",
        format: ["production", "development", "test"],
        default: "development",
        "env": "NODE_ENV"
    },
    ip: {
        doc: "The IP address the application server should bind",
        format: "ipaddress",
        default: "127.0.0.1",
        env: "IP_ADDRESS",
    },
    port: {
        doc: "The port the application server should bind",
        format: "port",
        default: "9080",
        env: "PORT",
        arg: "port"
    },
    dirs: {
        doc: "The directories the application server should bind",
        input: {
            doc: "The directory all other directories are resolved from",
            format: "*",
            default: "app",
            env: "INPUT_DIR",
            arg: "input"
        },
        views: {
            doc: "The directory where application views are located",
            format: "*",
            default: "app",
            env: "VIEWS_DIR",
            arg: "views"
        },
        data: {
            doc: "The directory where global data files are located",
            format: "*",
            default: "data",
            env: "DATA_DIR",
            arg: "data"
        },
        static: {
            doc: "The directory where static files are located",
            format: "*",
            default: "../public",
            env: "STATIC_DIR",
            arg: "static"
        }
    }
})

module.exports = (config = {}) => {
    schema.load(config)

    const env = schema.get('env')
    const dirs = schema.get('dirs')

    Object.keys(dirs).forEach(key => {
        const val = dirs[key]
        let appVal = val

        if (key === "input") {
            appVal = getFromApp(val)
        } else {
            const pathFromRoot = path.resolve(schema.get('dirs.input'), val)
            appVal = getFromApp(pathFromRoot)
        }

        schema.set(`dir.${key}`, appVal)
    })

    //schema.validate()

    return schema
}