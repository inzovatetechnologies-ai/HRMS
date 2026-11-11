const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const outPath = path.join(__dirname, '..', 'src', 'lib', 'db-bundle.ts');

if (fs.existsSync(dbPath)) {
  const data = fs.readFileSync(dbPath);
  const base64 = data.toString('base64');
  const content = `// Auto-generated bundled database file (size: ${data.length} bytes)
export const DB_BASE64 = "${base64}";
`;
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`[BUNDLE-DB] Successfully bundled ${data.length} bytes into ${outPath}`);
} else {
  console.warn(`[BUNDLE-DB] prisma/dev.db not found at ${dbPath}`);
}
