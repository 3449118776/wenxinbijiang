var babel = require('@babel/core');
var fs = require('fs');

var files = [
  'assets/js/write-editor.js',
  'assets/js/ai-local.js',
  'assets/js/architecture.js'
];

files.forEach(function(f) {
  if (!fs.existsSync(f)) { console.log('SKIP: ' + f); return; }
  try {
    var result = babel.transformFileSync(f, {
      presets: [['@babel/preset-env', { targets: { browsers: ['ios_saf >= 9', 'android >= 4.4'] } }]]
    });
    fs.writeFileSync(f, result.code, 'utf8');
    console.log('OK: ' + f);
  } catch(e) {
    console.log('ERROR: ' + f + ' - ' + e.message.split('\n')[0]);
  }
});
