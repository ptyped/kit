const path = require('path');

const Config = require('./config')
const Dependency = require('./dependency')

const configInstance = new Config()
const config = configInstance.config
const { create, resolveDependencyType } = Dependency
const paths = [
    ['Github short-form', 'ptyped/ptyped-kit-starter', 0, {
        name: 'ptyped-kit-starter',
        type: "GIT",
        input: 'ptyped/ptyped-kit-starter',
        output: path.resolve(config.get('dirs.dependencies'), 'ptyped-kit-starter')
      }],
    ['Github prefix', 'github:ptyped/ptyped-kit-starter', 0, {
        name: 'ptyped-kit-starter',
        type: "GIT",
        input: 'github:ptyped/ptyped-kit-starter',
        output: path.resolve(config.get('dirs.dependencies'), 'ptyped-kit-starter')
      }],
    ['Bitbucket prefix', 'bitbucket:ptyped/ptyped-kit-starter', 0, {
        name: 'ptyped-kit-starter',
        type: "GIT",
        input: 'bitbucket:ptyped/ptyped-kit-starter',
        output: path.resolve(config.get('dirs.dependencies'), 'ptyped-kit-starter')
    }],
    ['Gitlab prefix', 'gitlab:ptyped/ptyped-kit-starter', 0, {
        name: 'ptyped-kit-starter',
        type: "GIT",
        input: 'gitlab:ptyped/ptyped-kit-starter',
        output: path.resolve(config.get('dirs.dependencies'), 'ptyped-kit-starter')
    }],
    ['Direct prefix', 'direct:https://github.com/ptyped/ptyped-kit-starter.git', 1, {
        name: 'ptyped-kit-starter',
        type: "DIRECT",
        input: 'direct:https://github.com/ptyped/ptyped-kit-starter.git',
        output: path.resolve(config.get('dirs.dependencies'), 'ptyped-kit-starter')
    }],
    ['Web [http]', 'http://example.com/filename.png', 2, {
        name: 'filename.png',
        type: "WEB",
        input: 'http://example.com/filename.png',
        output: path.resolve(config.get('dirs.dependencies'), 'filename.png')
    }],
    ['Web [https]', 'https://example.com/filename.png', 2, {
        name: 'filename.png',
        type: "WEB",
        input: 'https://example.com/filename.png',
        output: path.resolve(config.get('dirs.dependencies'), 'filename.png')
    }],
    ['File prefix', 'file:../path/to/file_or_folder', 3, {
        name: 'file_or_folder',
        type: "FILE",
        input: path.resolve(process.cwd(), '../path/to/file_or_folder'),
        output: path.resolve(config.get('dirs.dependencies'), 'file_or_folder')
    }]
]

describe('Expect correct dependency type resolution', () => {
    test.each(paths)('Expect %s to work', (name, dependencyPath, expected) => {
        expect(resolveDependencyType(dependencyPath)).toBe(expected)
    })
})

describe('Expect dependency creation to work correctly', () => {    
    test.each(paths)('Expect %s to work', async (name, dependencyPath, type, expected) => {
        expect(await create(config, dependencyPath)).toEqual(expected)
    })
})