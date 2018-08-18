#!/usr/bin/env node

if (process.env.DEBUG) {
    require("time-require");
}

const fs = require('fs')
const nodemon = require("nodemon")
const path = require('path')
const pkg = require('../package.json')
const program = require('commander')

const {
    start,
    develop,
    build,
    init
} = require('./core/index')

program
    .version(pkg.version)
    .name(pkg.name)
    .description(pkg.description)

program
    .command('init')
    .action(init)

program
    .command('start')
    .action(start)

program
    .command('build')
    .action(build)

program
    .command('develop')
    .action(() => {
        const script = path.resolve(__dirname, "./index.js")

        nodemon({
            script: script,
            ext: 'js, json',
            ignore: []
        }).on('quit', function () {
            try {
                const portFile = path.resolve(process.cwd(), '.port.tmp')

                if (fs.existsSync(portFile)) {
                    fs.unlinkSync()
                }
            } catch (err) {
                throw err
            }
            process.exit(0)
        })
    })

program
    .parse(process.argv)