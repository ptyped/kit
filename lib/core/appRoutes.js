const express = require('express')
const fs = require('fs')
const glob = require('glob');
const matter = require('gray-matter');
const path = require('path');

const {
    getFromApp,
    renderStaticPath
} = require('./utils')

/**
 * Generates express routes from routefiles in application
 * 
 * @param {*} config 
 * @param {*} app 
 */
module.exports = (config, app) => {
    const baseDir = getFromApp(config.get('dirs.input'))
    const routesPaths = getAppRoutes(baseDir)
    const staticRoutes = routesPaths.filter(p => path.extname(p) !== ".js")
    const dynamicRoutes = routesPaths.filter(p => path.extname(p) === ".js")

    // TODO: enable
    // staticRoutes.forEach(r => addStaticRoutes(r, config.get('dirs.views'), config, app))
    dynamicRoutes.forEach(r => addDynamicRoutes(r, config.get('dirs.views'), config, app))
}

const getAppRoutes = baseDir => {
    const globPattern = baseDir + "/**/routes.{js,yml,json,toml}";
    const globOpts = {};
    const routes = glob.sync(globPattern, globOpts);

    if (routes[0] !== baseDir) {
        return routes;
    }

    return [];
}

/**
 * Render routes from static filetypes
 * 
 * TODO: revise, currently disabled
 * 
 * @param {*} routesFile 
 * @param {*} baseDir 
 * @param {*} config 
 * @param {*} app 
 */
const addStaticRoutes = (routesFile, baseDir, config, app) => {
    const router = express.Router()
    const routesContent = fs.readFileSync(routesFile)
    const routes = matter(`---\n${routesContent}\n---`).data
    const routesPath = getRoutesPath(routesFile, baseDir)

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
}

const addDynamicRoutes = (routesFile, baseDir, config, app) => {
    const router = express.Router()
    const routes = require(routesFile)
    const routesPath = getRoutesPath(routesFile, baseDir)

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
}

const getRoutesPath = (routesFile, baseDir) => {
    const routesDir = path.dirname(routesFile)
    const routesBase = routesDir.slice(baseDir.length)
    const routesPath = routesBase.length > 0 ? routesBase : "/"

    return routesPath
}