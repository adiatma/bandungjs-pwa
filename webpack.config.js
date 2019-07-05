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
  const isModeProduction = environment.mode === 'production'

  return {
    mode: environment.mode,
    devServer: {
      contentBase: appResolve('build'),
      port: 8000,
    },
    entry: appResolve('src/index.js'),
    output: {
      path: appResolve('build'),
      filename(name) {
        if (isModeProduction) {
          return '[name].[hash].bundle.js'
        }

        return '[name].bundle.js'
      },
    },
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name(file) {
                  if (isModeProduction) {
                    return '[hash].[ext]'
                  }

                  return '[path][name].[ext]'
                },
              },
            },
          ],
        },
      ],
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
