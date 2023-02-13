const path = require('path');
const TerserWebpackPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/index.mjs',
    module: {
        rules: [
            {
                loader:  'babel-loader',
                test: /\.mjs$/,
                include: [
                    path.resolve(__dirname, 'src'),
                ],
                options: {
                    presets: [
                        '@babel/preset-env'
                    ]
                },
            }
        ],
    },
    resolve: {
        modules: [
            'node_modules',
            path.resolve(__dirname, 'src'),
        ],
        extensions: ['.mjs', '.js', '.json', '.jsx', '.css'],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserWebpackPlugin(),
        ],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'web-scraper-client.min.js',
        library: {
            type: 'var',
            name: 'WebScraperClient',
            export: 'default',
        },
    }
};
