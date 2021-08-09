/**
 * AUTO GENERATED FILE - DO NOT EDIT
 * Any changes you make to this file will be overwritten by @digittl/auto-lint
 * If you'd like to customize this configuration, create a file called: '.stylelintrc.project.js' in
 * your project root.
 *
 * Note: Arrays will be concatenated. If you'd like to replace the array, just make the first
 * item in the array '!merge-strategy:replace'
 */
module.exports = require('@digittl/lintr')('.stylelintrc.project.js', {
  extends: [
    'stylelint-config-recommended',
    'stylelint-config-sass-guidelines',
    'stylelint-config-prettier',
  ],
  plugins: ['stylelint-order'],
  rules: {
    'no-descending-specificity': null,
    'at-rule-no-unknown': null,
    'max-nesting-depth': null,
    'font-family-no-missing-generic-family-keyword': null,
    'selector-no-qualifying-type': null,
    'selector-max-compound-selectors': null,
    'selector-class-pattern': null,
    'selector-pseudo-element-no-unknown': null,
    'selector-max-id': null,
    'no-invalid-position-at-import-rule': null,
    'scss/at-mixin-pattern': null,
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'layer',
          'variants',
          'responsive',
          'screen',
        ],
      },
    ],
  },
});
