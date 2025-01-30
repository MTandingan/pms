module.exports = {
    devServer: {
      proxy: {
        '^/api': {
          target: 'http://localhost:5006/',
          changeOrigin: true
        },
      }
    },
    configureWebpack: {
      devtool: 'source-map'
    }
}