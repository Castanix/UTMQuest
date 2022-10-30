module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue', 'ts', 'tsx'],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    '^.+\\.(js|jsx)?$': 'babel-jest',
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts?$': 'ts-jest',
    "^.+\\.(js|jsx)$": "babel-jest",
    '\\.[jt]sx?$': 'esbuild-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  snapshotSerializers: ['jest-serializer-vue'],
  testMatch: [
    '<rootDir>/(tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx))'
  ],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/', 
    "node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)", 
    "/node_modules/(?!react-dnd|dnd-core|@react-dnd)",
    "node_modules/(?!(jest-)?react-native|@react-native-community|@react-native-picker)",
    "node_modules/(?!(jest-)?react-native|@react-native-community|@react-native-picker)",
    "node_modules/react-markdown"
  ]
};