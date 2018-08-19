const fs = require('fs')
const glob = require('glob');
const matter = require('gray-matter');
const path = require('path');
const router = require('express').Router
const { getFromApp } = require('./utils')

/**
 * Generates express routes from routefiles in application
 * 
 * @param {*} config 
 * @param {*} app 
 */
module.exports = (config, app) => {
    const baseDir = getFromApp(config.dirs.input)
    const routesPaths = getAppRoutes(baseDir)
    const staticRoutes = routesPaths.filter(p => path.extname(p) !== "js")
    const dynamicRoutes = routesPaths.filter(p => path.extname(p) === "js")

    staticRoutes.forEach(r => addStaticRoutes(r, baseDir, app))
    dynamicRoutes.forEach(r => addDynamicRoutes(r, baseDir, app))

    app.use(router)
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

const addStaticRoutes = (routesFile, baseDir, app) => {
    const routesContent = fs.readFileSync(routesFile)
    const routes = matter(`---\n${routesContent}\n---`)
    const routesPath = getRoutesPath(routesFile, baseDir)

    if (Array.isArray(routes)) {
        routes.forEach(r => {
            const { path, template, data } = r

            if (path && template) {
                router.use(routesPath, (req, res, next) => {
                    res.render(template, data ? data : {})
                })
            }
        })
    }
}

const addDynamicRoutes = (routesFile, baseDir, app) => {
    const routes = require(routesFile)
    const routesPath = getRoutesPath(routesFile, baseDir)

    if (typeof routes === "function") {
        router.use(routesPath, routes)
    }
}

const getRoutesPath = (routesFile, baseDir) => {
    const routesDir = path.dirname(routesFile)
    const routesBase = routesDir.slice(baseDir.length)
    const routesPath = routesBase.length > 0 ? routesBase : "/"
    
    return routesPath
}

  