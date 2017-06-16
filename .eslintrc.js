// http://eslint.org/docs/user-guide/configuring

module.exports = {
  // root: true,
  // parser: 'babel-eslint',
  // parserOptions: {
  //   sourceType: 'module'
  // },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'kaola',
  // required to lint *.vue files
  // plugins: [
  //   'html'
  // ],
  globals: {
      require: true,
      module: true
  },
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
     "no-use-before-define": ["error", { "functions": false, "classes": true, "variables": true }]
  }
}
