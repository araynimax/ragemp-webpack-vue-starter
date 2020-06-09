const glob = require('glob');
const path = require('path');
const fs = require('fs');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const packageJson = require('./package.json');
const camelCase = require('camelcase');

const server = {
  target: 'node',
  entry: path.join(__dirname, 'src/server/index.js'),
  output: {
    path: path.resolve(packageJson['rage:mp']['serverLocation'], 'packages', camelCase(packageJson['rage:mp']['packageName'])),
    filename: 'index.js'
  },
};

const client = {
  target: 'node',
  entry: path.join(__dirname, 'src/client/index.js'),
  output: {
    path: path.resolve(packageJson['rage:mp']['serverLocation'], 'client_packages'),
    filename: 'index.js'
  },
};

const cefs = glob.sync(path.resolve(__dirname, 'src/cefs/*'))
  .filter(location => fs.statSync(location).isDirectory())
  .map(location => {
    const templatePath = path.join(location, 'index.ejs')
    const hasCustomTemplate = fs.existsSync(templatePath);

    return {
      target: 'web',
      entry: path.join(location, 'index.js'),
      output: {
        path: path.resolve(packageJson['rage:mp']['serverLocation'], 'client_packages', camelCase(packageJson['rage:mp']['packageName'] + 'Cefs'), path.basename(location)),
        filename: 'app.js'
      },
      module: {
        rules: [
          {
            test: /\.css$/,
            use: [
              'vue-style-loader',
              'css-loader'
            ],
          },
          {
            test: /\.scss$/,
            use: [
              'vue-style-loader',
              'css-loader',
              'sass-loader'
            ],
          },
          {
            test: /\.sass$/,
            use: [
              'vue-style-loader',
              'css-loader',
              'sass-loader?indentedSyntax'
            ],
          },
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
              loaders: {
                'scss': [
                  'vue-style-loader',
                  'css-loader',
                  'sass-loader'
                ],
                'sass': [
                  'vue-style-loader',
                  'css-loader',
                  'sass-loader?indentedSyntax'
                ]
              }
            }
          },
          {
            test: /\.(png|jpg|gif|svg)$/,
            loader: 'file-loader',
            options: {
              name: '[name].[ext]?[hash]'
            }
          },
          {
            test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: '[name].[ext]',
                  outputPath: 'public/fonts/'
                }
              }
            ]
          },
        ]
      },
      resolve: {
        alias: {
          'vue$': 'vue/dist/vue.esm.js',
          '@': location
        },
        extensions: ['*', '.js', '.vue', '.json']
      },
      devtool: '#source-map',
      plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
          template: hasCustomTemplate ? templatePath : path.resolve(__dirname, 'src/cefs/default.index.ejs'),
        }),
      ]
    };
  });


module.exports = [
  server,
  client,
  ...cefs,
];