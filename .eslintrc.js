module.exports = {
  env: {
    'browser': true,
  },
  parserOptions: {
    'ecmaVersion': 2018,
  },
  globals: {
    'ethereum': 'readonly',
  },
  plugins: [
    'json',
  ],
  extends: [
    '@metamask/eslint-config',
    '@metamask/eslint-config/config/nodejs',
  ],
  overrides: [{
    'files': ['src/*.js', 'src/assets/css/*', 'src/assets/fonts/*', 'src/assets/img/*', 'src/assets/js/*', 'src/assets/scss/*'],
    'parserOptions': {
      'sourceType': 'module',
    },
  }],
  ignorePatterns: [
    '!.eslintrc.js',
    'dist',
  ],
}
