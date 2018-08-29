#!/usr/bin/env node

if (process.env.DEBUG) {
    require("time-require");
}

const program = require('commander')
const fs = require('fs')

const Config = require('./core/config')
const Daemon = require('./core/daemon')

const configInstance = new Config()
const config = configInstance.config
const localConfig = config.getProperties()
const pkg = require('../package.json')
const {
    build,
    init,
    updateDependencies,
    start
} = require('./index')
let {
    getFromProject,
    getConfigArgs
} = require('./core/utils')
let args = getConfigArgs(config.getSchema())

getFromProject = getFromProject(config)

if (config.getArgs[0] !== "daemon") {
    config.set('verbose', true)
}

/**
 * Initialize program
 */
program
    .version(pkg.version)
    .name('pkit')
    .description(pkg.description)

/**
 * Add args to program
 */
Object.keys(args).forEach(key => {
    program
        .option(`--${args[key].arg}`, args[key].doc)
})

/**
 * Init command
 */
program
    .command('init [projectDir]')
    .action((dir, cmd) => init(localConfig, dir))

/**
 * Update command
 */
program
.command('update [projectDir]')
.action((dir, cmd) => updateDependencies(localConfig, dir))

/**
 * Start command
 */
program
    .command('start')
    .action(() => start(localConfig))

/**
 * Build command
 */
program
    .command('build')
    .action(() => build(localConfig))

/**
 * Add daemon command
 */
program
    .command('daemon')
    .option('--stop', 'Stops the daemon process')
    .action((args) => {
        let pkgApp
        const pkgAppPath = getFromProject('package.json')

        if (fs.existsSync(pkgAppPath)) {
            pkgApp = require(pkgAppPath)
        }

        const pkgName = pkgApp ? pkgApp.name : pkg.name
        const daemon = new Daemon(config, pkgName)

        if (args.stop) {
            daemon.stop()
        } else {
            daemon.start()
        }
    })

/**
 * Show error for unknown commands
 */
program.on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.\n', program.args.join(' '));
    process.exit(0);
});

/**
 * Add arguments to program
 */
program
    .parse(process.argv)