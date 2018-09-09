#!/usr/bin/env node
const fs = require('fs-extra')
const path = require('path')
const request = require('supertest')

const App = require('../lib/core/app')
const Config = require('../lib/core/config')
const routesPath = path.resolve(__dirname, '../lib/fixtures/app/routes.json')
const routes = JSON.parse(fs.readFileSync(routesPath, {encoding: 'utf8'}))

/**
 * Gets responses from routes used in testing for easy updating
 */
const getResponses = async (cwd) => {
    if (!cwd) cwd = process.cwd()

    try {
        const configInstance = new Config({cwd: cwd})
        const config = configInstance.config
        const app = new App(config)
        const paths = Object.keys(routes)

        for (var key in paths) {
            const p = paths[key]
            const val = routes[p]
            const outputDir = path.resolve(__dirname, "../lib/fixtures/app/responses/")
            const output = path.resolve(outputDir, val + ".tmp")
            const res = await request(app.app).get(p)

            if (!fs.existsSync(outputDir)) {
                fs.mkdirpSync(outputDir)
            }

            fs.writeFileSync(output, res.text)
        }

        return
    } catch (err) {
        throw new Error(err)
    }
}

module.exports = getResponses;

// TODO: make everything after a simple cli
(async () => {
    const cwd = path.resolve(__dirname, '../lib/fixtures/app/default_project')

    await getResponses(cwd)
    process.exit(0)
})()