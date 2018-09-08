const fs = require('fs');
const path = require('path');
const remove = require('rimraf');

const Config = require('./config')
const Dependency = require('./dependency')

const { get } = Dependency

describe('Expect dependencies to fetch correctly', () => {
    let config, cwd
    const paths = [
        ['Github short-form', 'ptyped/ptyped-kit-starter', 'ptyped-kit-starter'],
        ['Github prefix', 'github:ptyped/ptyped-kit-starter', 'ptyped-kit-starter'],
        ['Direct prefix', 'direct:https://github.com/ptyped/ptyped-kit-starter.git','ptyped-kit-starter'],
        ['Web [https]', 'https://unpkg.com/bootstrap@4.1.3/dist/js/bootstrap.js', 'bootstrap.js'],
        ['File prefix', `file:${path.resolve(__dirname, '../fixtures/dependency/file.txt')}`, 'file.txt']
    ]
    

    beforeAll(() => {
        const rand = String(new Date().getUTCMilliseconds())
        cwd = path.resolve(process.cwd(), "lib/fixtures/.tmp", rand)
        const configInstance = new Config({cwd: cwd})
        config = configInstance.config
    })

    afterAll(() => {
        remove.sync(cwd)
    })

    test.each(paths)('Expect %s %s to download as %s in dependencies dir', async (name, input, output) => {
        const expected = path.resolve(config.get('dirs.dependencies'), output)

        await get(config, input)

        expect(fs.existsSync(expected)).toBe(true)
        remove.sync(expected)
    })
})
