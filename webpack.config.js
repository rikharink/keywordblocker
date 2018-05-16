const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader');
const rxPaths = require('rxjs/_esm5/path-mapping');
const isProd = process.env.NODE_ENV === "production";

const extractSass = new ExtractTextPlugin({
    filename: path.join("styles", "[name].css")
});

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
    devtool: isProd ? "hidden-source-map" : "cheap-eval-source-map",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: "awesome-typescript-loader"
            },
            {
                enforce: "pre", test: /\.js$/,
                exclude: /node_modules/,
                loader: "source-map-loader",
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: extractSass.extract({
                    use: [{
                        loader: "css-loader"
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
                    }]
                })
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".scss"],
        alias: Object.assign(rxPaths(), 
        {
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
        extractSass,
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
        new CheckerPlugin()
    ]
};

if (isProd) {
    const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    const uglifyJs = new UglifyJsPlugin({
        sourceMap: true,
        parallel: true,
        uglifyOptions: {
            compress: {
                passes: 3,
            }
        }
    });
    const bundleAnalyzer = new BundleAnalyzerPlugin();
    const moduleConcatenation = new webpack.optimize.ModuleConcatenationPlugin();
    config.plugins.push(moduleConcatenation, uglifyJs, bundleAnalyzer);
}
else {
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