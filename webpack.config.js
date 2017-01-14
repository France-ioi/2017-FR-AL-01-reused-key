const path = require('path');
const webpack = require('webpack');
const SRC = path.resolve(__dirname, "src");

const config = module.exports = {
  entry: {
    vendor: [],
    index: ['./src/index.js']
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/',
    libraryTarget: "var",
    library: "Task"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: SRC,
        loader: 'babel'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(eot|svg|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
        loader: 'file?name=fonts/[name].[ext]'
      }
    ]
  },
  resolve: {
    root: SRC,
    extensions: ['', '.js']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.js",
      minChunks: function (module) { return /node_modules/.test(module.resource); }
    })
  ]
};

if (process.env.NODE_ENV === 'development') {
  config.devtool = 'inline-source-map';
} else {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }));
}
