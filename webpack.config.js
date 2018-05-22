const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const {
    CheckerPlugin,
    TsConfigPathsPlugin
} = require('awesome-typescript-loader');
const rxPaths = require('rxjs/_esm5/path-mapping');
const isProd = process.env.NODE_ENV === "production";

const config = {
    entry: {
        popup: path.join(__dirname, "src", "scripts", "popup.ts"),
        options: path.join(__dirname, "src", "scripts", "options.ts"),
        content_script: path.join(__dirname, "src", "scripts", "content_script.ts"),
        background: path.join(__dirname, "src", "scripts", "background.ts"),
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].bundle.js"
    },
    devtool: isProd ? false : "cheap-eval-source-map",
    optimization: {
        usedExports: true,
        concatenateModules: true,
        occurrenceOrder: true,
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: true,
                    ecma: 6,
                    output: {
                        comments: false
                    },
                    compress: {
                        dead_code: true,
                        drop_console: true,
                    }
                },
                sourceMap: false
            })
        ]
    },
    module: {
        rules: [{
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: "awesome-typescript-loader"
            },
            {
                enforce: "pre",
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "source-map-loader",
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
                        loader: "postcss-loader",
                        options: {
                            config: {
                                ctx: {
                                    cssnext: {
                                        warnForDuplicates: false
                                    },
                                    cssnano: {
                                        preset: 'default'
                                    }
                                }
                            }
                        }
                    },
                    {
                        loader: "sass-loader"
                    }
                ]

            },
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".scss"],
        alias: Object.assign(rxPaths(), {
            '@fortawesome/fontawesome-free-solid$': '@fortawesome/fontawesome-free-solid/shakable.es.js',
            '@fortawesome/fontawesome-free-brands$': '@fortawesome/fontawesome-free-brands/shakable.es.js',
        }),
        plugins: [
            new TsConfigPathsPlugin()
        ]
    },
    plugins: [
        new CleanWebpackPlugin(["dist"]),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        }),
        new CopyWebpackPlugin([{
                from: path.join(__dirname, "src", "manifest.json"),
                transform: function (content, path) {
                    // generates the manifest file using the package.json informations
                    return Buffer.from(JSON.stringify({
                        description: process.env.npm_package_description,
                        version: process.env.npm_package_version,
                        ...JSON.parse(content.toString())
                    }))
                },
                to: path.join(__dirname, "dist", "manifest.json")
            },
            {
                from: path.join(__dirname, "src", "img"),
                to: path.join(__dirname, "dist", "img")
            }
        ]),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src", "popup.html"),
            filename: "popup.html",
            chunks: ["popup"]
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src", "options.html"),
            filename: "options.html",
            chunks: ["options"]
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src", "background.html"),
            filename: "background.html",
            chunks: ["background"]
        }),
        new CheckerPlugin(),
        new MiniCssExtractPlugin({
            filename: path.join("styles", "[name].css")
        })
    ]
};

if (isProd) {
    // const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    // const bundleAnalyzer = new BundleAnalyzerPlugin();
    // config.plugins.push(bundleAnalyzer);
} else {
    const ChromeExtensionReloader = require("webpack-chrome-extension-reloader");
    const chromeExtensionReloader = new ChromeExtensionReloader({
        port: 9090,
        reloadPage: true,
        entries: {
            contentScript: "content_script",
            background: "background"
        }
    });
    config.plugins.push(chromeExtensionReloader);
}

module.exports = config;