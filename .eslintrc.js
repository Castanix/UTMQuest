module.exports = {
	'env': {
		'browser': true,
		'es2021': true,
	},
	'extends': ["airbnb", "airbnb/hooks"],
	'overrides': [
	],
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaVersion': 'latest',
		'sourceType': 'module'
	},
	'plugins': [
		'react',
		'@typescript-eslint'
	],
	'ignorePatterns': ["*.test.tsx"],
	'rules': {
		'import/extensions': "off",
		'import/no-unresolved': "off",
		"react/jsx-filename-extension": [1, { "extensions": [".tsx", ".ts"] }],
		"react/function-component-definition": [
			2,
			{
			  namedComponents: "arrow-function",
			  unnamedComponents: "arrow-function",
			},
		],
		'no-console': "off"
	}
};
