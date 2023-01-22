module.exports = {
	'env': {
		'browser': true,
		'es2021': true,
		"jest/globals": true
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
		'@typescript-eslint',
		"jest"
	],
	'ignorePatterns': ["*.test.tsx", "cypress/*", "cypress.config.ts"],
	'rules': {
		"react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    	"react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
		'import/extensions': "off",
		'import/no-unresolved': "off",
		"react/require-default-props": "off",
		'import/no-extraneous-dependencies': "off",
		'jsx-a11y/no-noninteractive-element-interactions': "off",
		'jsx-a11y/click-events-have-key-events': "off",
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
		"no-plusplus": "off",
		"no-unused-vars": "off",
		"@typescript-eslint/no-unused-vars": ["error", { "varsIgnorePattern": "^_" }],
		"no-shadow": "off",
		"@typescript-eslint/no-shadow": ["error"]
	}
};
