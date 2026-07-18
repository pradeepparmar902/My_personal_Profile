const fs = require('fs');
let code = fs.readFileSync('src/components/pages/Admin.tsx', 'utf8');
const lines = code.split('\n');
const newLines = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Site Logo') && i > 2800) {
    skip = true;
    i += 38; 
    continue;
  }
  newLines.push(lines[i]);
}
fs.writeFileSync('src/components/pages/Admin.tsx', newLines.join('\n'));
console.log('Fixed');
