const path = require('path')

const Config = require('./config')
const Template = require('./template')

describe('Expect template to resolve', () => {
    var template, cwd, config
    cwd = path.resolve(process.cwd(), "lib/fixtures/generated_project")
    const configInstance = new Config({cwd: cwd})
    config = configInstance.config
    template = new Template(config)

    test('Expect template path to be "/lib/fixtures/generated_project"', () => {
        const expected = cwd

        expect(template.projectPath).toBe(expected)
    })

    test(`Expect "template.template" to be ${config.get('template')}`, () => {
        expect(template.template).toBe(config.get('template'))
    })

    it(`Expect template dependency to resolve`, async () => {
        const output = path.resolve(process.cwd(), 'lib/fixtures/default_project/node_modules/ptyped-kit-starter')
        await template.getDependency()

        expect(template.dependency).not.toBe(undefined)
        expect(template.dependency.type).toBe("NPM")
        expect(template.dependency.input).toBe(config.get('template'))
        expect(template.dependency.name).toBe('ptyped-kit-starter')
    })
})