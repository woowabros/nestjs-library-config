module.exports = {
    '*.(md|yaml|yml)': ['prettier --write'],
    '*.+(ts|js|json)': ['eslint --fix', 'prettier --write'],
    '*.+(ts)': [() => 'tsc -p tsconfig.lib.json --noEmit', () => 'tsc -p tsconfig.spec.json --noEmit'],
};
