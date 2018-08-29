const convict = require('convict')
const fs = require('fs')
const path = require('path')

const debug = require('debug')("pkit:config")
const dependency = require('./dependency')
const pkg = require('../../package.json')

const {
    getFromProject
} = require('./utils')

class Config {
    constructor(userConfig, cwd) {
        this.schema = {
            cwd: {
                doc: "The working directory of the project",
                format: "String",
                default: process.cwd()
            },
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
            kitModule: {
                doc: "The NPM dependency to be added for the kit node_module",
                format: "String",
                default: `${pkg.name}@${pkg.version}`,
                arg: "kitModule"
            },
            template: {
                doc: "The prototype template to initialize the project with",
                format: "*",
                default: "ptyped-kit-starter",
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
            },
            publicPath: {
                doc: "The path that public files are served from",
                format: "String",
                default: "/public"
            },
            dirs: {
                input: {
                    doc: "The directory all other directories are resolved from",
                    format: "*",
                    default: "app",
                    env: "INPUT_DIR",
                    arg: "inputDir"
                },
                views: {
                    doc: "The directory where application views are located",
                    format: "*",
                    default: "views",
                    env: "VIEWS_DIR",
                    arg: "viewsDir"
                },
                data: {
                    doc: "The directory where global data files are located",
                    format: "*",
                    default: "data",
                    env: "DATA_DIR",
                    arg: "dataDir"
                },
                assets: {
                    js: {
                        doc: "The folder containing javscript to be compiled",
                        format: "*",
                        default: "assets/js",
                        arg: "jsDir"
                    },
                    css: {
                        doc: "The folder containing javscript to be compiled",
                        format: "*",
                        default: "assets/css",
                        arg: "cssDir"
                    },
                    scss: {
                        doc: "The folder containing javscript to be compiled",
                        format: "*",
                        default: "assets/css",
                        arg: "scssDir"
                    }
                },
                static: {
                    doc: "The directory where static files are located",
                    format: "*",
                    default: "../public",
                    env: "STATIC_DIR",
                    arg: "staticDir"
                },
                dependencies: {
                    doc: "The directory where dependencies are stored",
                    format: "String",
                    default: "../public/.dependencies",
                    env: "DEPENDENCIES_DIR",
                    arg: "dependenciesDir"
                }
            }
        }
        this.configure(userConfig, cwd)
        this.getFromProject = getFromProject(this.config)
        this.loadFromProjectPackage()
        this.resolveDirectoriesFromProject()
        this.config.validate()
        debug("Config: %o", this.config.getProperties()) 
    }

    configure(userConfig, cwd) {
        debug("Initializing config")
        this.config = convict(this.schema)

        if (typeof userConfig === "object") {
            debug("Loading manual config")
            this.config.load(userConfig)
        }

        if (cwd) {
            const absCwd = path.resolve(process.cwd(), cwd)
            debug("Setting `cwd` to " + absCwd)
            this.config.set('cwd', absCwd)
        }
    }

    loadFromProjectPackage() {
        const pkgPath = this.getFromProject('package.json')

        if (fs.existsSync(pkgPath)) {
            debug("Fetching project config from " + pkgPath)
            const pkg = fs.readFileSync(pkgPath)
            const pkgData = JSON.parse(pkg).pkit

            if (pkgData) {
                debug("Loading project config from `package.json`")
                this.config.load(pkgData)
            }

            debug("Config: %o", this.config.getProperties()) 
        }
    }

    async loadFromTemplateConfig() {
        this.templateDep = await dependency.create(this.config, this.config.get('template'))
        const templateConfigPath = this.getFromProject(path.join('node_modules', this.templateDep.name, ".kit.js"))

        if (fs.existsSync(templateConfigPath)) {
            debug("Fectching template config from " + templateConfigPath)
            const templateConfig = require(templateConfigPath)

            if (typeof templateConfig === "function") {
                debug("Initializing and loading config function")
                this.config.load(templateConfig(this.config))
            } else if (typeof templateConfig == "object") {
                debug("Loading config object")
                this.config.load(templateConfig)
            }

            debug("Config: %o", this.config.getProperties())

            this.loadFromProjectPackage()
        }
    }

    resolveDirectoriesFromProject() {
        const dirs = this.config.get('dirs')

        debug("Read project dirs %o", dirs)
        const resolveDirs = (dirs, parents) => Object.keys(dirs).map(key => {
            const val = dirs[key]
            let appVal = val

            if (key === "input" && parents === "dirs.") {
                appVal = this.getFromProject(val)
            } else if (typeof appVal === "object") {
                const nextParents = parents + `${key}.`
                resolveDirs(appVal, nextParents)
            } else {
                const pathFromRoot = path.resolve(this.config.get('dirs.input'), val)
                appVal = this.getFromProject(pathFromRoot)
            }

            if (typeof appVal !== "object") {
                this.config.set(`${parents}${key}`, appVal)
            }
        })

        debug("Resolved project directories %o", dirs)

        resolveDirs(dirs, 'dirs.')
    }
}

module.exports = Config