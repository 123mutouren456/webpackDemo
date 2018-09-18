const merge = require('webpack-merge');
const base  = require('./webpack.base.js');
const webpack = require('webpack');
const uglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = merge(base, {
    plugins:[
        new uglifyJSPlugin({
            uglifyOptions: {
                "ie8": true
            }
        }),
        new CopyWebpackPlugin([{
            from:__dirname + '/src/lib',
            to: 'lib'
        }])
        
    ]
})