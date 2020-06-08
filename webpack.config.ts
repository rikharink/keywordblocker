import * as webpack from 'webpack';
import * as path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserJSPlugin from 'terser-webpack-plugin';
// import ExtensionReloader from 'webpack-extension-reloader';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ExtensionReloader = require('webpack-extension-reloader');

const config = {
    mode: 'production',
    entry: {
        popup: path.join(__dirname, 'src', 'scripts', 'popup.ts'),
        options: path.join(__dirname, 'src', 'scripts', 'options.ts'),
        content_script: path.join(__dirname, 'src', 'scripts', 'content_script.ts'),
        background: path.join(__dirname, 'src', 'scripts', 'background.ts'),
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.js'],
    },
    devtool: '',
    optimization: {
        usedExports: true,
        concatenateModules: true,
        occurrenceOrder: true,
        minimizer: [
            new TerserJSPlugin({
                parallel: true,
                sourceMap: true,
            }),
            new OptimizeCSSAssetsPlugin({}),
        ],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'source-map-loader',
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,

                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            config: {
                                ctx: {
                                    cssnext: {
                                        warnForDuplicates: false,
                                    },
                                },
                            },
                        },
                    },
                    {
                        loader: 'sass-loader',
                    },
                ],
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
            },
        ],
    },
    plugins: [
        new ExtensionReloader({
            port: 9090,
            reloadPage: true,
            entries: {
                contentScript: 'content_script',
                background: 'background',
                extensionPage: ['popup', 'options'],
            },
        }),
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: false,
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            },
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join(__dirname, 'src', 'manifest.json'),
                    transform: function (content, _) {
                        // generates the manifest file using the package.json informations
                        return Buffer.from(
                            JSON.stringify({
                                description: process.env.npm_package_description,
                                version: process.env.npm_package_version,
                                ...JSON.parse(content.toString()),
                            }),
                        );
                    },
                    to: path.join(__dirname, 'dist', 'manifest.json'),
                },
                {
                    from: path.join(__dirname, 'src', 'img'),
                    to: path.join(__dirname, 'dist', 'img'),
                },
            ],
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'popup.ejs'),
            filename: 'popup.html',
            chunks: ['popup'],
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'options.ejs'),
            filename: 'options.html',
            chunks: ['options'],
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'background.ejs'),
            filename: 'background.html',
            chunks: ['background'],
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
    ],
};

module.exports = (_: any, argv: any) => {
    config.mode = argv.mode;
    if (config.mode === 'development') {
        config.devtool = 'cheap-module-source-map';
    }
    return config;
};
