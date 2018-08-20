#!/usr/bin/env node
if (process.env.DEBUG) {
    require("time-require");
}

const program = require('commander')

const config = require('./core/config')()
const pkg = require('../package.json')
const daemon = require('./core/daemon')
const { getConfigArgs } = require('./core/utils')
const {
    start,
    init
} = require('./index')

let args = getConfigArgs(config.getSchema())

/**
 * Initialize program
 */
program
    .version(pkg.version)
    .name(pkg.name)
    .description(pkg.description)

/**
 * Add init command
 */
program
    .command('init')
    .action(() => init())

/**
 * Add start command
 */
program
    .command('start')
    .option(`--${args['port'].arg}`, args['port'].doc)
    .option(`--${args['dirs.input'].arg}`, args['dirs.input'].doc)
    .option(`--${args['dirs.views'].arg}`, args['dirs.views'].doc)
    .option(`--${args['dirs.data'].arg}`, args['dirs.data'].doc)
    .option(`--${args['dirs.static'].arg}`, args['dirs.static'].doc)
    .action(() => start())

/**
 * Add daemon command
 */
program
    .command('daemon')
    .option('--stop', 'Stops the daemon process')
    .option(`--${args['port'].arg}`, args['port'].doc)
    .option(`--${args['dirs.input'].arg}`, args['dirs.input'].doc)
    .option(`--${args['dirs.views'].arg}`, args['dirs.views'].doc)
    .option(`--${args['dirs.data'].arg}`, args['dirs.data'].doc)
    .option(`--${args['dirs.static'].arg}`, args['dirs.static'].doc)
    .action((args) => {
        if (args.stop) {
            daemon.stop()
        } else {
            daemon.start()
        }
    })

program
    .parse(process.argv)