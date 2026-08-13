const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

// ── Persistent storage outside dist/ so git deploys & restarts NEVER wipe uploaded files ─────
const COVERS_DIR    = path.join(__dirname, 'covers_store');
const WRAPPERS_DIR  = path.join(__dirname, 'covers_store', 'wrappers');
const PROPOSALS_DIR = path.join(__dirname, 'proposals_store');

if (!fs.existsSync(COVERS_DIR))    fs.mkdirSync(COVERS_DIR,    { recursive: true });
if (!fs.existsSync(WRAPPERS_DIR))  fs.mkdirSync(WRAPPERS_DIR,  { recursive: true });
if (!fs.existsSync(PROPOSALS_DIR)) fs.mkdirSync(PROPOSALS_DIR, { recursive: true });

// Possible locations for the main static dist folder
const possibleDistPaths = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, '.builds', 'source', 'repository', 'dist'),
  __dirname
];

function getProto(req) {
  return req.headers['x-forwarded-proto'] || 'https';
}
function getHost(req) {
  return req.headers['x-forwarded-host'] || req.headers.host || 'pradeepparmar.com';
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  // ────────────────────────────────────────────────────────────────
  // DIAGNOSTIC: /debug-proposals — check what files actually exist
  // ────────────────────────────────────────────────────────────────
  if (urlPath === '/debug-proposals') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    try {
      const coversFiles    = fs.existsSync(COVERS_DIR)    ? fs.readdirSync(COVERS_DIR)    : [];
      const wrappersFiles  = fs.existsSync(WRAPPERS_DIR)  ? fs.readdirSync(WRAPPERS_DIR)  : [];
      const proposalsFiles = fs.existsSync(PROPOSALS_DIR) ? fs.readdirSync(PROPOSALS_DIR) : [];
      res.end(JSON.stringify({ __dirname, COVERS_DIR, PROPOSALS_DIR, coversFiles, wrappersFiles, proposalsFiles }, null, 2));
    } catch (e) {
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ────────────────────────────────────────────────────────────────
  // SERVE cover images + wrappers: /covers/**  → covers_store/**
  // ────────────────────────────────────────────────────────────────
  if (urlPath.startsWith('/covers/')) {
    const relativePath = urlPath.slice('/covers/'.length);
    const coverFile = path.join(COVERS_DIR, relativePath);
    if (!coverFile.startsWith(COVERS_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }
    if (fs.existsSync(coverFile) && fs.statSync(coverFile).isFile()) {
      const ext = path.extname(coverFile).toLowerCase();
      const ct  = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': 'public, max-age=86400' });
      fs.createReadStream(coverFile).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Cover not found: ' + relativePath);
    }
    return;
  }

  // ────────────────────────────────────────────────────────────────
  // API: POST /api/save-proposal-cover
  // Saves cover PNG + generates lightweight OG wrapper HTML
  // ────────────────────────────────────────────────────────────────
  if (req.method === 'POST' && urlPath === '/api/save-proposal-cover') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      try {
        const { filename, title, description, imageBase64 } = JSON.parse(body);
        const safeName    = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const baseName    = safeName.replace(/\.html?$/i, '');
        const coverFile   = baseName + '-cover.jpg';
        const wrapperFile = baseName + '-card.html';

        // Save cover image to persistent covers_store/
        let coverUrl = '';
        if (imageBase64) {
          try {
            const imgBuf = Buffer.from(
              imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64'
            );
            fs.writeFileSync(path.join(COVERS_DIR, coverFile), imgBuf);
            coverUrl = `${getProto(req)}://${getHost(req)}/covers/${coverFile}`;
          } catch (e) { console.error('[cover save error]', e.message); }
        }

        // Build wrapper HTML with correct og:image
        const proto      = getProto(req);
        const host       = getHost(req);
        const actualUrl  = `${proto}://${host}/proposals/${safeName}`;
        const wrapperUrl = `${proto}://${host}/covers/wrappers/${wrapperFile}`;
        const safeTitle  = (title || baseName.replace(/_/g, ' ')).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeDesc   = (description || 'Interactive Executive Proposal').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const wrapperHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${safeTitle}</title>
<meta name="description" content="${safeDesc}"/>
<meta property="og:type" content="article"/>
<meta property="og:site_name" content="Pradeep Parmar"/>
<meta property="og:title" content="${safeTitle}"/>
<meta property="og:description" content="${safeDesc}"/>
${coverUrl ? `<meta property="og:image" content="${coverUrl}"/>
<meta property="og:image:secure_url" content="${coverUrl}"/>
<meta property="og:image:type" content="image/jpeg"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${safeTitle}"/>
<meta name="twitter:description" content="${safeDesc}"/>
<meta name="twitter:image" content="${coverUrl}"/>` : ''}
<meta property="og:url" content="${wrapperUrl}"/>
</head>
<body style="background:#0a0a0a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;">
${coverUrl ? `<div><img src="${coverUrl}" style="max-width:340px;border-radius:16px;margin-bottom:20px;box-shadow:0 8px 32px rgba(212,175,55,.3);" alt="${safeTitle}"/><br/>` : '<div>'}
<h1 style="font-size:1.6rem;color:#fff;margin-bottom:8px;">${safeTitle}</h1>
<p style="color:#aaa;max-width:480px;margin:0 auto 24px;">${safeDesc}</p>
<a href="${actualUrl}" style="display:inline-block;background:#d4af37;color:#000;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:.95rem;">Open Proposal →</a>
</div>
<script>
  var ua = (navigator.userAgent||'').toLowerCase();
  if (!/bot|crawler|spider|facebook|whatsapp|telegram|slack|linkedin|twitter/i.test(ua)) {
    window.location.replace('${actualUrl}');
  }
</script>
</body>
</html>`;

        // Save wrapper to covers_store/wrappers/
        fs.writeFileSync(path.join(WRAPPERS_DIR, wrapperFile), wrapperHtml, 'utf8');

        // ALSO write wrapper to dist/proposals/
        for (const dp of possibleDistPaths) {
          const pp = path.join(dp, 'proposals');
          try {
            if (!fs.existsSync(pp)) fs.mkdirSync(pp, { recursive: true });
            fs.writeFileSync(path.join(pp, wrapperFile), wrapperHtml, 'utf8');
          } catch {}
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, wrapperUrl, coverUrl, wrapperFile }));
      } catch (err) {
        console.error('[save-proposal-cover error]', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ────────────────────────────────────────────────────────────────
  // API: POST /api/upload-proposal — save full HTML to persistent proposals_store/
  // ────────────────────────────────────────────────────────────────
  if (req.method === 'POST' && urlPath === '/api/upload-proposal') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      try {
        const { filename, htmlContent } = JSON.parse(body);
        if (!filename || !htmlContent) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'filename and htmlContent are required' }));
          return;
        }
        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

        // Save to persistent proposals_store directory outside dist/
        fs.writeFileSync(path.join(PROPOSALS_DIR, safeName), htmlContent, 'utf8');

        // Also save to dist/proposals for fast serving
        for (const dp of possibleDistPaths) {
          const pp = path.join(dp, 'proposals');
          try {
            if (!fs.existsSync(pp)) fs.mkdirSync(pp, { recursive: true });
            fs.writeFileSync(path.join(pp, safeName), htmlContent, 'utf8');
          } catch {}
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

  // ────────────────────────────────────────────────────────────────
  // DIAGNOSTIC: /debug
  // ────────────────────────────────────────────────────────────────
  if (urlPath === '/debug') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    try {
      const rootFiles = fs.readdirSync(__dirname);
      const distPath  = path.join(__dirname, 'dist');
      const distFiles = fs.existsSync(distPath) ? fs.readdirSync(distPath) : [];
      res.end(JSON.stringify({ __dirname, rootFiles, distFiles }, null, 2));
    } catch (e) {
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ────────────────────────────────────────────────────────────────
  // STATIC FILE SERVING & PERSISTENT PROPOSAL RESOLUTION
  // ────────────────────────────────────────────────────────────────
  let filePath = null;

  // 1. Check wrappers folder for *-card.html requests
  if (urlPath.startsWith('/proposals/') && urlPath.endsWith('-card.html')) {
    const wrapperCandidate = path.join(WRAPPERS_DIR, path.basename(urlPath));
    if (fs.existsSync(wrapperCandidate)) filePath = wrapperCandidate;
  }

  // 2. Check persistent proposals_store for /proposals/*.html requests
  if (!filePath && urlPath.startsWith('/proposals/')) {
    const proposalCandidate = path.join(PROPOSALS_DIR, path.basename(urlPath));
    if (fs.existsSync(proposalCandidate) && fs.statSync(proposalCandidate).isFile()) {
      filePath = proposalCandidate;
    }
  }

  // 3. Fall back to checking dist/ directories
  if (!filePath) {
    for (const dp of possibleDistPaths) {
      const candidate = path.join(dp, urlPath);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        filePath = candidate;
        break;
      }
    }
  }

  // Fallback to index.html for React Router (non-asset paths)
  if (!filePath) {
    if (path.extname(urlPath).length > 0) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + urlPath);
      return;
    }
    for (const dp of possibleDistPaths) {
      const candidate = path.join(dp, 'index.html');
      if (fs.existsSync(candidate)) { filePath = candidate; break; }
    }
  }

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found - file is missing: ' + urlPath);
    return;
  }

  const extname     = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Persistent Proposals stored at: ${PROPOSALS_DIR}`);
});
