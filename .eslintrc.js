module.exports = {
	'env': {
		'browser': true,
		'es2021': true,
	},
	'extends': ["airbnb", "airbnb/hooks", "prettier"],
	'overrides': [
	],
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaVersion': 'latest',
		'sourceType': 'module'
	},
	'plugins': [
		'react',
		'react-hooks',
		'@typescript-eslint'
	],
	'ignorePatterns': ["*.test.tsx", "cypress/*", "cypress.config.ts"],
	'rules': {
		"react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    	"react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
		'import/extensions': "off",
		'import/no-unresolved': "off",
		'import/no-extraneous-dependencies': "off",
		"react/jsx-filename-extension": [1, { "extensions": [".tsx", ".ts"] }],
		"react/function-component-definition": [
			2,
			{
			  namedComponents: "arrow-function",
			  unnamedComponents: "arrow-function",
			},
		],
		'no-console': "off",
		"no-underscore-dangle": ["error", { "allow": ["_id"] }],
		"semi": [2, "always"],
		"no-plusplus": "off"
	}
};
