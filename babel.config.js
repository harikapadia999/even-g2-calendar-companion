module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@services': './src/services',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@types': './src/types',
          '@config': './src/config',
          '@utils': './src/utils',
          '@store': './src/store',
        },
      },
    ],
  ],
};
