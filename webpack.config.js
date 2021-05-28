const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "none",
  entry: {
    "graphology-neo4j": ["./src/index.ts"],
    "graphology-neo4j.min": "./src/index.ts"
  },
  output: {
    path: path.resolve(__dirname, "./lib/umd"),
    filename: "[name].js",
    library: "graphology-neo4j",
    libraryTarget: "umd",
    globalObject: "this"
  },
  devtool: "source-map",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js$/
      })
    ]
  },
  stats: {
    errorDetails: true
  },
  resolve: {
    extensions: [".ts"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader"
      }
    ]
  },
  externals: {
    graphology: "graphology",
    "neo4j-driver": "neo4j-driver"
  }
};
