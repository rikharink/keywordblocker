module.exports = ({ file, options, env }) => ({
    plugins: {
      'postcss-cssnext': options.cssnext ? options.cssnext : false,
      'cssnano': env === 'production' ? options.cssnano : false
    }
  })