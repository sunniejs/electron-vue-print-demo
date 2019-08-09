module.exports = {
  lintOnSave: true,
  crossorigin: 'use-credentials',
  productionSourceMap: false,
  pages: {
    index: {
      // page 的入口
      entry: 'src/main.js',
      // 模板来源
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  chainWebpack: config => {
    config.module.rule('fonts').test(/\.(woff2?|eot|ttf|otf|ttc)(\?.*)?$/i)
  }
}
