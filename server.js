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

  // NEW: Lightweight endpoint - saves cover image + generates tiny OG wrapper HTML
  // This is the CORRECT approach for WhatsApp: share the wrapper URL (tiny page with OG tags)
  // The wrapper instantly redirects users to the actual proposal. WhatsApp sees the OG image.
  if (req.method === 'POST' && urlPath === '/api/save-proposal-cover') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', () => {
      try {
        const { filename, title, description, imageBase64 } = JSON.parse(bodyData);
        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const baseName  = safeName.replace(/\.html?$/i, '');
        const coverName   = baseName + '-cover.png';
        const wrapperName = baseName + '-card.html';

        // Determine where to save files
        let proposalsDir = null;
        for (const distPath of possibleDistPaths) {
          const candidate = path.join(distPath, 'proposals');
          if (fs.existsSync(candidate)) { proposalsDir = candidate; break; }
        }
        if (!proposalsDir) {
          // Create it in the first dist path
          proposalsDir = path.join(possibleDistPaths[0], 'proposals');
          try { fs.mkdirSync(proposalsDir, { recursive: true }); } catch (e) {}
        }

        // Save cover PNG
        let coverUrl = '';
        if (imageBase64) {
          try {
            const imgBuf = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            fs.writeFileSync(path.join(proposalsDir, coverName), imgBuf);
            const protocol = req.headers['x-forwarded-proto'] || 'https';
            const host = req.headers['x-forwarded-host'] || req.headers.host || 'pradeepparmar.com';
            coverUrl = `${protocol}://${host}/proposals/${coverName}`;
          } catch (e) { console.error('Cover save error:', e.message); }
        }

        // Generate tiny OG wrapper HTML (< 3KB)
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'pradeepparmar.com';
        const actualUrl = `${protocol}://${host}/proposals/${safeName}`;
        const wrapperUrl = `${protocol}://${host}/proposals/${wrapperName}`;
        const safeTitle = (title || baseName.replace(/_/g, ' ')).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeDesc  = (description || 'Interactive Executive Proposal').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const wrapperHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${safeTitle}</title>
<meta name="description" content="${safeDesc}"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${safeTitle}"/>
<meta property="og:description" content="${safeDesc}"/>
${coverUrl ? `<meta property="og:image" content="${coverUrl}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:image" content="${coverUrl}"/>` : ''}
<meta property="og:url" content="${wrapperUrl}"/>
<meta http-equiv="refresh" content="0;url=${actualUrl}"/>
</head>
<body style="background:#0a0a0a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
<div style="text-align:center;">
${coverUrl ? `<img src="${coverUrl}" style="max-width:300px;border-radius:12px;margin-bottom:20px;" alt="Cover"/>` : ''}
<h1 style="font-size:1.5rem;margin-bottom:8px;">${safeTitle}</h1>
<p style="color:#aaa;">${safeDesc}</p>
<p style="color:#d4af37;margin-top:20px;">Opening proposal...</p>
</div>
<script>setTimeout(function(){window.location.href='${actualUrl}';},500);</script>
</body>
</html>`;

        fs.writeFileSync(path.join(proposalsDir, wrapperName), wrapperHtml, 'utf8');

        // Also write to public/proposals if it exists
        const pubDir = path.join(__dirname, 'public', 'proposals');
        if (fs.existsSync(path.join(__dirname, 'public'))) {
          try { fs.mkdirSync(pubDir, { recursive: true }); } catch (e) {}
          try { fs.writeFileSync(path.join(pubDir, wrapperName), wrapperHtml, 'utf8'); } catch (e) {}
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, wrapperUrl, coverUrl, wrapperName }));
      } catch (err) {
        console.error('save-proposal-cover error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ORIGINAL: Upload full HTML proposal to disk
  if (req.method === 'POST' && urlPath === '/api/upload-proposal') {
    let bodyData = '';
    req.on('data', chunk => bodyData += chunk);
    req.on('end', () => {
      try {
        const { filename, htmlContent, imageBase64 } = JSON.parse(bodyData);
        if (!filename || !htmlContent) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'filename and htmlContent are required' }));
          return;
        }

        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const coverName = safeName.replace(/\.html?$/i, '') + '-cover.png';
        
        let imgBuffer = null;
        if (imageBase64) {
          try {
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            imgBuffer = Buffer.from(base64Data, 'base64');
          } catch (e) {
            console.error('Error parsing base64 image', e);
          }
        }

        for (const distPath of possibleDistPaths) {
          const proposalsDir = path.join(distPath, 'proposals');
          if (!fs.existsSync(proposalsDir)) {
            try { fs.mkdirSync(proposalsDir, { recursive: true }); } catch (e) {}
          }
          const targetFile = path.join(proposalsDir, safeName);
          try { fs.writeFileSync(targetFile, htmlContent, 'utf8'); } catch (e) {}
          
          if (imgBuffer) {
            try { fs.writeFileSync(path.join(proposalsDir, coverName), imgBuffer); } catch (e) {}
          }
        }

        const publicProposalsDir = path.join(__dirname, 'public', 'proposals');
        if (fs.existsSync(path.join(__dirname, 'public'))) {
          if (!fs.existsSync(publicProposalsDir)) try { fs.mkdirSync(publicProposalsDir, { recursive: true }); } catch (e) {}
          try { fs.writeFileSync(path.join(publicProposalsDir, safeName), htmlContent, 'utf8'); } catch (e) {}
          if (imgBuffer) {
            try { fs.writeFileSync(path.join(publicProposalsDir, coverName), imgBuffer); } catch (e) {}
          }
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

  // === Smart OG Image Extraction for Proposal HTML files ===
  // When a /proposals/*.html file is served, check if og:image is base64.
  // If so, extract it, save as a real PNG, and serve modified HTML with a real URL.
  // This makes WhatsApp link previews work correctly since WhatsApp cannot load base64 images.
  const isProposalHtml = extname === '.html' && urlPath.startsWith('/proposals/');

  fs.readFile(filePath, 'utf8', (err, rawContent) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error: ' + err.message);
      return;
    }

    if (isProposalHtml) {
      try {
        // Match base64 og:image (any quote style, property before or after content)
        const base64Match = rawContent.match(
          /<meta[^>]+property=["']og:image["'][^>]+content=["'](data:image\/(png|jpeg|jpg|webp);base64,[^"']{100,})["']/i
        ) || rawContent.match(
          /<meta[^>]+content=["'](data:image\/(png|jpeg|jpg|webp);base64,[^"']{100,})["'][^>]+property=["']og:image["']/i
        );

        if (base64Match) {
          const base64Data = base64Match[1];
          const mimeType = base64Match[2] || 'png';
          const ext = mimeType === 'jpeg' || mimeType === 'jpg' ? 'jpg' : 'png';
          const baseName = path.basename(filePath, '.html').replace(/[^a-zA-Z0-9._-]/g, '_');
          const coverFilename = baseName + '-cover.' + ext;

          // Determine the proposals directory from the file path
          const proposalsDir = path.dirname(filePath);
          const coverPath = path.join(proposalsDir, coverFilename);

          // Save the PNG only if it doesn't already exist
          if (!fs.existsSync(coverPath)) {
            const imgBuf = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            try { fs.writeFileSync(coverPath, imgBuf); } catch (e) {
              console.error('Could not save cover image:', e.message);
            }
          }

          // Build the public URL for the cover image
          const protocol = req.headers['x-forwarded-proto'] || 'https';
          const host = req.headers['x-forwarded-host'] || req.headers.host || 'pradeepparmar.com';
          const coverUrl = `${protocol}://${host}/proposals/${coverFilename}`;

          // Replace base64 in HTML with real URL
          const modifiedHtml = rawContent.replace(base64Data, coverUrl);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(modifiedHtml, 'utf-8');
          return;
        }
      } catch (ogErr) {
        console.error('OG image extraction error:', ogErr.message);
        // Fall through to serve original content
      }
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(rawContent, 'utf-8');
  });
});

server.listen(PORT, () => {
  console.log(`Dependency-free server running on port ${PORT}`);
});
