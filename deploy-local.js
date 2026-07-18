import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, 'dist');
// Go up 3 directories from repository: repository -> source -> .builds -> public_html
const destination = path.join(__dirname, '..', '..', '..');

console.log(`Copying files from ${source} to ${destination}`);

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  
  const items = fs.readdirSync(from);
  for (const item of items) {
    const srcPath = path.join(from, item);
    const destPath = path.join(to, item);
    
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${item}`);
    }
  }
}

try {
  copyFolderSync(source, destination);
  console.log('Successfully copied all files to public_html!');
  
  // Write the React SPA .htaccess file to public_html
  const htaccessContent = `
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
  `.trim();
  
  fs.writeFileSync(path.join(destination, '.htaccess'), htaccessContent);
  console.log('Successfully wrote .htaccess for React routing!');
  
} catch (error) {
  console.error('Failed to copy files:', error);
}
