const merge = require('webpack-merge');
const base  = require('./webpack.base.js');
const webpack = require('webpack');
module.exports = merge(base, {
    devtool: 'inline-source-map',
    devServer:{
       // contentBase: './dist',
        hot:true,
        host: '192.168.1.24',
        port:9090,
        proxy: {
            '/ke': {
                target: 'http://mock.sysware.com.cn/mock/23/',
                changeOrigin: true,
                disableHostCheck: true,
                noInfo: true
            }
        }
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
    
})