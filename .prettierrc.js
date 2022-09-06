module.exports = {
    arrowParens: 'always',
    bracketSpacing: false,
    jsxBracketSameLine: false,
    jsxSingleQuote: false,
    printWidth: 120,
    quoteProps: 'as-needed',
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    useTabs: false,
    tabWidth: 4,
    overrides: [
        {
            files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
            options: {
                parser: 'typescript',
            },
        },
    ],
};
