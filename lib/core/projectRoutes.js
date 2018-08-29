const express = require('express')
const fs = require('fs')
const glob = require('glob');
const matter = require('gray-matter');
const path = require('path');

const debug = require('debug')('pkit:projectRoutes')
const {
    getFromProject,
    renderStaticPath
} = require('./utils')

class ProjectRoutes {
    constructor(config) {
        this.config = config
        this.getFromProject = getFromProject(this.config)
        this.routeFiles = this.getAppRouteFiles(this.config.get('dirs.input'))
        this.staticRouteFiles = this.routeFiles.filter(p => path.extname(p) !== ".js")
        this.dynamicRouteFiles = this.routeFiles.filter(p => path.extname(p) === ".js")
    }

    getAppRouteFiles(baseDir) {
        const globPattern = baseDir + "/**/routes.{js,yml,json,toml}";
        const globOpts = {};
        const routes = glob.sync(globPattern, globOpts);

        if (routes[0] !== baseDir) {
            return routes;
        }

        return [];
    }

    addStaticRoutes(app) {
        this.staticRouteFiles.forEach(routesFile => {
            const router = express.Router()
            const routesContent = fs.readFileSync(routesFile)
            const routes = matter(`---\n${routesContent}\n---`).data
            const routesPath = this.getRoutesPath(routesFile, this.config.get('dirs.views'))

            if (Array.isArray(routes)) {
                routes.forEach(r => {
                    let {
                        route,
                        redirect,
                        template,
                        data
                    } = r
                    data = data ? data : {}

                    if (route && redirect) {
                        route.use(route, (req, res, next) => {
                            res.redirect(redirect)
                        })
                    }

                    if (route && template) {
                        router.use(route, (req, res, next) => {
                            renderStaticPath(config, template, res, next)
                        })
                    }
                })
            }

            app.use(routesPath, router)
        })
    }

    addDynamicRoutes(app) {
        this.dynamicRouteFiles.forEach(routesFile => {
            const router = express.Router()
            const routes = require(routesFile)
            const routesPath = this.getRoutesPath(routesFile, this.config.get('dirs.views'))

            if (typeof routes === "object") {
                Object.keys(routes).forEach(routePattern => {
                    const routeFunc = routes[routePattern]

                    if (typeof routeFunc === "function") {
                        router.use(routePattern, routeFunc)
                    }

                    if (typeof routeFunc === "string") {
                        router.use(routePattern, (req, res, next) => {
                            res.redirect(routeFunc)
                        })
                    }
                })
            }

            app.use(routesPath, router)
        })
    }

    getRoutesPath(routesFile, baseDir) {
        const routesDir = path.dirname(routesFile)
        const routesBase = routesDir.slice(baseDir.length)
        const routesPath = routesBase.length > 0 ? routesBase : "/"

        return routesPath
    }
}

module.exports = ProjectRoutes