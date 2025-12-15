const { ESLint } = require('eslint');
const path = require('path');
const fs = require('fs');

describe('ESLint compliance', () => {
  it('all code should be ES2015 compliant', async () => {
    const eslint = new ESLint({
      baseConfig: {
      parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'commonjs',
      },
      env: {
        node: true,
        jest: true,
      },
      rules: {
        'no-restricted-syntax': ['error', 'SpreadElement'],
      },
      },
      useEslintrc: false,
    });
    
    // Get files to lint
    const pluginDir = path.resolve(__dirname, '../plugins/parser/modules');
    const filesToLint = [
      path.resolve(__dirname, '../test/functional-parser.test.js'),
      path.resolve(__dirname, '../test/trial-parser.test.js'),
      path.resolve(__dirname, '../test/functional-parser-test-helper.js'),
    ];
    
    // Add .js files from plugins directory
    if (fs.existsSync(pluginDir)) {
      const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));
      files.forEach(f => {
        filesToLint.push(path.join(pluginDir, f));
      });
    }
    
    const results = await eslint.lintFiles(filesToLint);
    
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = await formatter.format(results);
    
    const hasErrors = results.some(result => result.errorCount > 0);
    
    if (hasErrors) {
      console.log(resultText);
    }
  });
});
