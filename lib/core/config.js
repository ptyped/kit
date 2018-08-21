const convict = require('convict')
const fs = require('fs')
const path = require('path')
const dependency = require('./dependency')

const { getFromApp } = require('./utils')
const schema = convict({
    env: {
        doc: "The application's environment",
        format: ["production", "development", "test"],
        default: "development",
        "env": "NODE_ENV"
    },
    verbose: {
        doc: "Log messages to the console",
        format: "Boolean",
        default: false,
        arg: "verbose"
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
            default: "views",
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
        assets: {
            js: {
                doc: "The folder containing javscript to be compiled",
                format: "*",
                default: "assets/js",
                arg: "js"
            },
            css: {
                doc: "The folder containing javscript to be compiled",
                format: "*",
                default: "assets/css",
                arg: "css"
            },
            scss: {
                doc: "The folder containing javscript to be compiled",
                format: "*",
                default: "assets/css",
                arg: "scss"
            }
        },
        static: {
            doc: "The directory where static files are located",
            format: "*",
            default: "../public",
            env: "STATIC_DIR",
            arg: "static"
        }
    },
    template: {
        doc: "The prototype template to initialize the project with",
        format: "*",
        default: "ptyped/ptyped-kit-starter",
        arg: "template"
    },
    dependencies: {
        doc: "Any web-based third-party dependencies to be served as static files",
        format: "*",
        default: [],
        arg: "dependencies"
    },
    configureWebpack: {
        doc: "Custom webpack configuration options",
        format: "Object",
        default: {}
    },
    configurePostcss: {
        doc: "Custom postcss configuration options for .css builds",
        format: "Object",
        default: {}
    },
    configureSass: {
        doc: "Custom Sass configuration options for .scss builds",
        format: "Object",
        default: {}
    },
    configurePostcssAfterSass: {
     doc: "Custom Postcss configuration options for .scss builds",
     format: "Object",
     default: {}
    }
})

module.exports = async (config = {}) => {
    const pkgPath = getFromApp('package.json')
    schema.load(config)

    if (fs.existsSync(pkgPath)) {
        const pkg = fs.readFileSync(pkgPath)
        const pkgData = JSON.parse(pkg).prototypingKit

        if (pkgData) {
            schema.load(pkgData)
        }
    }
    
    const env = schema.get('env')
    const dirs = schema.get('dirs')

    const resolveDirs = (dirs, parents) => Object.keys(dirs).map(key => {
        const val = dirs[key]
        let appVal = val

        if (key === "input" && parents === "dirs.") {
            appVal = getFromApp(val)
        } else if (typeof appVal === "object") {
            const nextParents = parents + `${key}.`
            resolveDirs(appVal, nextParents)
        } else {
            const pathFromRoot = path.resolve(schema.get('dirs.input'), val)
            appVal = getFromApp(pathFromRoot)
        }

        if (typeof appVal !== "object") {
            schema.set(`${parents}${key}`, appVal)
        }
    })

    resolveDirs(dirs, 'dirs.')
    schema.validate()

    return schema
}