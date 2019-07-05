const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')

/**
 * @param {string} filename
 * @return {string}
 */
function appResolve(filename) {
  return path.resolve(__dirname, filename)
}

function createHTML({title, template}) {
  return new HTMLWebpackPlugin({
    title,
    template,
  })
}

/**
 * @param {object} environment
 * @return {object}
 */
function webpackConfig(environment) {
  return {
    mode: environment.mode,
    devServer: {
      contentBase: appResolve('build'),
      port: 8000,
    },
    entry: appResolve('src/index.js'),
    output: {
      path: appResolve('build'),
      filename: '[name].js',
    },
    plugins: [
      createHTML({
        title: 'Meetup BandungJS #21',
        template: appResolve('public/index.html'),
      }),
    ],
  }
}

module.exports = webpackConfig
