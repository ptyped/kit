#!/usr/bin/env node

const Config = require('./core/config')

const configInstance = new Config()
const config = configInstance.config
const localConfig = config.getProperties()
const { start } = require('./index')

start(localConfig)