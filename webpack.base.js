const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
    entry:'./src/router/index.js',
    output:{
        filename:'js/[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        chunkFilename: 'js/[name].js'
    },
    module: {
        rules: [
             {
                test: /\.[s]?[ac]ss$/,
                use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [{
                            loader: "css-loader"
                        }, {
                            loader: 'postcss-loader'
                        }, {
                            loader: "sass-loader"
                        }]
                    })
            },
            {
                test:/\.(png|svg|jpg|gif|ttf|woff|eot|woff2)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        name: 'img/[name].[ext]?v=[hash:8]'
                    }
                }]
                
            },
            {
                test: /\.(htm[l]?|jsp)$/i,
                use: [{
                    loader: 'html-loader',
                    options: {
                        attrs: ['img:src', ':data-src'],
                        minimize: false
                    }
                }]
            }
            // {
            //     test: /\.js$/,
            //     loader: 'babel-loader'
            //     // query: {
            //     //     presets: ['env'],
            //     //     "ignore": [
            //     //         // "./src/js/mui/*.js"
            //     //     ]
            //     // }
            // }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'templates',"index.html"),
            filename: "index.html",
        }),
        new CleanWebpackPlugin(['dist']),
        new ExtractTextPlugin({ filename: 'css/[name].css?v=[hash:8]'}),
        new webpack.ProvidePlugin({ 
            $: 'jquery', 
            jQuery: 'jquery' 
        }) 
    ],
    optimization: {
        splitChunks: {
            chunks: 'initial', // 只对入口文件处理
            cacheGroups: {
                vendor: { // split `node_modules`目录下被打包的代码到 `page/vendor.js && .css` 没找到可打包文件的话，则没有。css需要依赖 `ExtractTextPlugin`
                    test: /node_modules\//,
                    name: 'vendor',
                    priority: 10,
                    enforce: true
                }
                // commons: { // split `common`和`components`目录下被打包的代码到`page/commons.js && .css`
                //     test: /js\//,
                //     name: 'commons',
                //     priority: 10,
                //     enforce: true
                // }
            }
        },
        runtimeChunk: {
            name: 'manifest'
        }
    },
}