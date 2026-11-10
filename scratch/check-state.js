const fs = require('fs');

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = dir + '/' + f;
    const stat = fs.statSync(p);
    if (stat.isDirectory() && f !== 'node_modules' && f !== '.next' && f !== '.git') {
      checkDir(p);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const content = fs.readFileSync(p, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (/useState\s*(?:<[^>]+>)?\s*\(\s*[A-Z]/.test(l)) {
          if (!l.includes('useState(false)') && !l.includes('useState(true)') && !l.includes('useState(null)') && !l.includes('useState("') && !l.includes("useState('") && !l.includes("useState(`") && !l.includes("useState(Date") && !l.includes("useState(ROLES") && !l.includes("useState(Array") && !l.includes("useState(TAB")) {
            console.log(p + ':' + (idx+1) + ' -> ' + l.trim());
          }
        }
      });
    }
  }
}
checkDir('src');
