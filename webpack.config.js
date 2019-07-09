const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {GenerateSW} = require('workbox-webpack-plugin')

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
 * @param {array} files
 */
function Copy(files) {
  return new CopyWebpackPlugin(files)
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
      historyApiFallback: true,
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
          test: /\.(png|jpe?g|gif|ico|mp3|wav|json)$/,
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
        {
          test: /\.css$/,
          exclude: /\.useable\.css$/,
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
            },
          ],
        },
        {
          test: /\.useable\.css$/,
          use: [
            {
              loader: 'style-loader/useable',
            },
            {
              loader: 'css-loader',
            },
          ],
        },
        {
          test: /\.svelte$/,
          exclude: /node_modules\/(?!(svero)\/).*/,
          use: {
            loader: 'svelte-loader'
          }
        },
      ],
    },
    plugins: [
      createHTML({
        title: 'Meetup BandungJS #21',
        template: appResolve('public/index.html'),
      }),

      Copy([
        {from: appResolve('public/favicon.ico'), to: './'},
        {from: appResolve('public/manifest.json'), to: './'},
        {from: appResolve('public/icons/'), to: './icons/'},
      ]),

      new GenerateSW({
        skipWaiting: true,
      }),
    ],
  }
}

module.exports = webpackConfig
