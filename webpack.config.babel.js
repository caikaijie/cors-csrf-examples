import path from 'path'
import autoprefixer from 'autoprefixer'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const config = {
  context: path.join(__dirname, './client'),
  entry: {
    app: './index.js'
  },
  output: {
    path: path.join(__dirname, './static'),
    filename: '[name].js',
    publicPath: '/'
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './client',
    hot: true,
    historyApiFallback: true
  },
  resolve: {
    extensions: [ '', '.js', '.jsx', '.scss', '.json', 'css' ],
    alias: {
      'components': path.resolve(__dirname, './client/components')
    }
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        include: [
          path.resolve(__dirname, './client')
        ],
        loader: 'style!css?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass?sourceMap',
      },
      {
        test: /\.css$/,
        loader: 'style!css'
      },
      {
        test: /\.(js|jsx)$/,
        include: [
          path.resolve(__dirname, './client')
        ],
        loaders: [
          'react-hot', 'babel-loader'
        ]
      }
    ]
  },
  postcss: [ autoprefixer ],
  plugins: [
    new HtmlWebpackPlugin({
      minify: {
        removeAttributeQuotes: true,
        removeComments: true
      },
      template: path.resolve(__dirname, './client/index.html')
    })
  ]
}

export default config
