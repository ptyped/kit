const path = require('path')

module.exports = {
    cwd: path.join(process.cwd(), "custom"),
    env: 'production',
    verbose: true,
    ip: "192.168.0.1",
    port: 1337,
    kitModule: "test",
    template: "ptyped-kit-starter-test",
    publicPath: "/test",
    dependencies: ['test'],
    configureWebpack: { test: "test" },
    configurePostcss: { test: "test" },
    configureSass: { test: "test" },
    configurePostcssAfterSass: { test: "test" },
    dirs: {
        input: "test_app",
        views: "test_views",
        data: "test_data",
        static: "test_static",
        dependencies: "test_dependencies",
        assets: {
            js: "test_js",
            css: "test_css",
            scss: "test_css"
        }
    }
}