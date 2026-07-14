module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['react-native'],
  rules: {
    'react-native/no-unused-styles': 'error',
    'react-native/no-inline-styles': 'error',
    'react-native/no-color-literals': 'error',
    'react-native/no-single-element-style-arrays': 'error',
  },
};
