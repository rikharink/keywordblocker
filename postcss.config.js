module.exports = ({
  file,
  options,
  env
}) => ({
  plugins: {
    'postcss-cssnext': options.cssnext ? options.cssnext : false,
  }
})