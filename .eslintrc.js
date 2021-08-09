/**
 * AUTO GENERATED FILE - DO NOT EDIT
 * Any changes you make to this file will be overwritten by @digittl/auto-lint
 * If you'd like to customize this configuration, create a file called: '.eslintrc.project.js' in
 * your project root.
 *
 * Note: Arrays will be concatenated. If you'd like to replace the array, just make the first
 * item in the array '!merge-strategy:replace'
 */
module.exports = require('@digittl/lintr')('.eslintrc.project.js', {
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended',
    'plugin:vue-scoped-css/recommended',
    'plugin:json/recommended',
    'prettier',
  ],
  plugins: ['vue', 'json', 'html'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    // Vendor
    Vue: 'readonly',
    Vuex: 'readonly',
    $: 'writable',
    axios: 'readonly',
    Hammer: 'readonly',
    dayjs: 'readonly',
    Cookies: 'readonly',
    gtag: 'readonly',
    fbq: 'readonly',
    blueshift: 'readonly',
    SearchSpring: 'readonly',
    IntelliSuggest: 'readonly',
    it: 'readonly',
    describe: 'readonly',
    // User
    App: 'readonly',
    trx: 'readonly',
    bifrost: 'readonly',
    StorageLocal: 'readonly',
    JsonUtil: 'readonly',
    s0da: 'readonly',
    CreatePromiseGate: 'readonly',
    CreateStorage: 'readonly',
    CreateQueue: 'readonly',
    Scroll: 'readonly',
    BreakPoints: 'readonly',
    RelativeOffset: 'readonly',
    QueryString: 'readonly',
    StampedFn: 'readonly',
    SearchSpringTheme: 'readonly',
  },
  rules: {
    'vue/comment-directive': 'off',
    'vue/script-setup-uses-vars': 'off',
    'vue/no-v-html': 'off',
  },
});
