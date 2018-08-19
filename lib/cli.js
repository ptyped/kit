#!/usr/bin/env node
const program = require('commander')

if (process.env.DEBUG) {
    require("time-require");
}

const pkg = require('../package.json')
const daemon = require('./core/daemon')

const {
    start,
    init
} = require('./index')

program
    .version(pkg.version)
    .name(pkg.name)
    .description(pkg.description)

program
    .command('init')
    .action(() => init())

program
    .command('start')
    .action(() => start())

program
    .command('daemon')
    .option('--stop', 'Stops the daemon process')
    .action((args) => {
        if (args.stop) {
            daemon.stop()
        } else {
            daemon.start()
        }
    })

program
    .parse(process.argv)