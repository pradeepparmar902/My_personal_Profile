const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  // Strip query parameters
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  
  // Search for the 'dist' folder in multiple locations
  // Depending on Hostinger's environment, app.js could be in public_html or inside the repository
  const possibleDistPaths = [
    path.join(__dirname, 'dist'),
    path.join(__dirname, '.builds', 'source', 'repository', 'dist'),
    __dirname
  ];

  // API Endpoint to upload proposal HTML directly to server disk
  if (req.method === 'POST' && urlPath === '/api/upload-proposal') {
    let bodyData = '';
    req.on('data', chunk => bodyData += chunk);
    req.on('end', () => {
      try {
        const { filename, htmlContent } = JSON.parse(bodyData);
        if (!filename || !htmlContent) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'filename and htmlContent are required' }));
          return;
        }

        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        for (const distPath of possibleDistPaths) {
          const proposalsDir = path.join(distPath, 'proposals');
          if (!fs.existsSync(proposalsDir)) {
            try { fs.mkdirSync(proposalsDir, { recursive: true }); } catch (e) {}
          }
          const targetFile = path.join(proposalsDir, safeName);
          try { fs.writeFileSync(targetFile, htmlContent, 'utf8'); } catch (e) {}
        }

        const publicProposalsDir = path.join(__dirname, 'public', 'proposals');
        if (fs.existsSync(path.join(__dirname, 'public'))) {
          if (!fs.existsSync(publicProposalsDir)) try { fs.mkdirSync(publicProposalsDir, { recursive: true }); } catch (e) {}
          try { fs.writeFileSync(path.join(publicProposalsDir, safeName), htmlContent, 'utf8'); } catch (e) {}
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, url: `/proposals/${safeName}` }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (urlPath === '/debug') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    try {
      const rootFiles = fs.readdirSync(__dirname);
      const distPath = path.join(__dirname, 'dist');
      let distFiles = [];
      let assetsFiles = [];
      if (fs.existsSync(distPath)) {
        distFiles = fs.readdirSync(distPath);
        const assetsPath = path.join(distPath, 'assets');
        if (fs.existsSync(assetsPath)) assetsFiles = fs.readdirSync(assetsPath);
      }
      res.end(JSON.stringify({ __dirname, rootFiles, distFiles, assetsFiles }, null, 2));
    } catch (e) {
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  let filePath = null;
  // Look for the exact file
  for (const distPath of possibleDistPaths) {
    const checkPath = path.join(distPath, urlPath);
    if (fs.existsSync(checkPath) && fs.statSync(checkPath).isFile()) {
      filePath = checkPath;
      break;
    }
  }

  // If not found, fallback to index.html for React Router
  if (!filePath) {
    // DO NOT fallback for static assets like .js, .css, .png
    if (path.extname(urlPath).length > 0) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found Asset: ' + urlPath);
      return;
    }

    for (const distPath of possibleDistPaths) {
      const checkPath = path.join(distPath, 'index.html');
      if (fs.existsSync(checkPath) && fs.statSync(checkPath).isFile()) {
        filePath = checkPath;
        break;
      }
    }
  }

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found - dist/index.html is missing.');
    return;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error: ' + err.message);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Dependency-free server running on port ${PORT}`);
});
