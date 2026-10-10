import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const scanDirectories = [
  path.join(projectRoot, 'app'),
  path.join(projectRoot, 'components'),
];

const placeholderRegex = /\[\[PLACEHOLDER:[^\]]+\]\]/g;
let foundPlaceholders = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    let match;
    while ((match = placeholderRegex.exec(line)) !== null) {
      foundPlaceholders.push({
        file: path.relative(projectRoot, filePath),
        line: index + 1,
        placeholder: match[0],
      });
    }
  });
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        walkDir(fullPath);
      }
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js|md|html)$/.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

for (const dir of scanDirectories) {
  walkDir(dir);
}

if (foundPlaceholders.length > 0) {
  console.error('\n⚠️  UNRESOLVED PUBLICATION PLACEHOLDERS FOUND:');
  console.error('====================================================');
  foundPlaceholders.forEach(({ file, line, placeholder }) => {
    console.error(`  - ${file}:${line} -> ${placeholder}`);
  });
  console.error('====================================================');
  console.error(`Total unresolved placeholders: ${foundPlaceholders.length}`);
  console.error('Supply real values before final public deployment.\n');
  process.exit(1);
} else {
  console.log('✓ All publication-facing content is clear of placeholder tokens.');
  process.exit(0);
}
