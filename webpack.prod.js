const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const outputPath = path.resolve(__dirname, 'build')
const pathTo = (...args) => path.resolve(__dirname, ...args)

module.exports = ({
	mode: 'production',
	target: 'web',
	entry: './src/index.js',
	output: {
		path: outputPath,
		filename: 'pointer.js',
		libraryTarget: 'umd'
	},
	devtool: 'none',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: [
					pathTo('node_modules')
				],
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [['env', {
								targets: {
									browsers: 'IE >= 11'
								},
								modules: false
							}]],
							plugins: [
								['transform-class-properties', { "spec": true }],
								'transform-object-rest-spread',
								'transform-react-pug',
								'transform-react-jsx'
							]
						}
					}
				]
			},
			{
				test: /\.cson$/,
				use: {
					loader: 'cson-loader'
				}
			},
			{
				test: /\.pug$/,
				use: {
					loader: 'pug-loader'
				}
			},
			{
				test: /\.(styl|css)$/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader'
					},
					{
						loader: 'stylus-loader',
						options: {
							use: []
						}
					}
				]
			}
		]
	},
	externals: [
		'react',
		'react-dom',
		'styled-components'
	],
	resolve: {
		extensions: ['.js', '.styl'],
		modules: ['node_modules', 'lib', 'shared'],
		mainFiles: ['index', 'connect', 'component'],
	},
	plugins: [
		new webpack.ProvidePlugin({
			React: 'react'
		})
	]
})
