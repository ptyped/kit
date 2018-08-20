const glob = require('glob')
const merge = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')

module.exports = config => {
    const entries = () => {
        let entries = {}

        const files = glob.sync(path.join(config.get('dirs.assets.js'), "/*.js"))
        
        files.map(file => {
            const fileName = path.basename(file)
            const extName = path.extname(fileName)
            const name = fileName.replace(extName, "")
            entries[name] = file
        })

        return entries
    }

    let webpackConfig = {
        mode: config.env === "production" ? "production" : "development",
        entry: entries(),
        output: {
            path: path.resolve(config.get('dirs.static')),
            filename: '[name].js',
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.(njk|nunjucks)$/,
                    loader: 'nunjucks-loader',
                    query: {
                        root: config.get('dirs.views')
                    }
                }
            ]
        },
        plugins: [],
        performance: {
            hints: false
        },
        devtool: '#eval-source-map'
    }

    if (config.env === "production") {
        webpackConfig.devtool = "#source-map"
        webpackConfig.plugins.concat([
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"production"'
                }
            })
        ])
    }

    if (config.configureWebpack) {
        webpackConfig = merge(webpackConfig, config.configureWebpack)
    }

    return webpack(webpackConfig)
}