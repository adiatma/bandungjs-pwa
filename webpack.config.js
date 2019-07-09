const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {GenerateSW} = require('workbox-webpack-plugin')
const Dotenv = require('dotenv-webpack')

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
 * @param {boolean} param.isModeProduction
 */
function FileLoader({isModeProduction}) {
  return {
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
  }
}

/**
 * @param {object} param.options
 */
function CSSLoader({...options}) {
  return {
    test: /\.css$/,
    exclude: /\.useable\.css$/,
    ...options,
  }
}

/**
 * @param {object} options
 */
function SvelteLoader({options} = {}) {
  return {
    test: /\.svelte$/,
    exclude: /node_modules\/(?!(svero)\/).*/,
    use: {
      loader: 'svelte-loader',
      options,
    },
  }
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
        FileLoader({isModeProduction}),

        CSSLoader({
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
            },
          ],
        }),

        CSSLoader({
          use: [
            {
              loader: 'style-loader/useable',
            },
            {
              loader: 'css-loader',
            },
          ],
        }),

        SvelteLoader(),
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

      new Dotenv(),
    ],

    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@config': path.resolve(__dirname, 'src/config'),
        '@stores': path.resolve(__dirname, 'src/stores'),
        '@assets': path.resolve(__dirname, 'src/assets'),
      }
    }
  }
}

module.exports = webpackConfig
