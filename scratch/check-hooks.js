const fs = require('fs');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let hasSeenEarlyReturn = false;
  let returnLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Reset on new function/component
    if (line.startsWith('export default function') || line.startsWith('export function') || (line.startsWith('function ') && !line.includes('() { return'))) {
      hasSeenEarlyReturn = false;
      returnLine = 0;
    }

    if (/^if\s*\(.*\)\s*return\b/.test(line) || /^if\s*\(.*\)\s*\{\s*return\b/.test(line)) {
      hasSeenEarlyReturn = true;
      returnLine = i + 1;
    }

    if (hasSeenEarlyReturn && (line.includes('useState(') || line.includes('useEffect(') || line.includes('useRef(') || line.includes('useRouter('))) {
      console.log(`Potential Hook Rule Violation in ${filePath}: Hook at line ${i + 1} appears AFTER early return at line ${returnLine}`);
    }
  }
}

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = dir + '/' + f;
    const stat = fs.statSync(p);
    if (stat.isDirectory() && f !== 'node_modules' && f !== '.next' && f !== '.git') {
      checkDir(p);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      checkFile(p);
    }
  }
}

checkDir('src');
console.log('Hook scan completed.');
