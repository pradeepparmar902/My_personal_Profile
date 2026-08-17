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
const COVERS_DIR     = path.join(__dirname, 'covers_store');
const WRAPPERS_DIR   = path.join(__dirname, 'covers_store', 'wrappers');
const PROPOSALS_DIR  = path.join(__dirname, 'proposals_store');
const LOGS_FILE_PATH = path.join(PROPOSALS_DIR, 'analytics_logs.json');

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

// ── Analytics Logging Helpers ─────────────────────────────────────────────
function loadAnalyticsLogs() {
  try {
    if (fs.existsSync(LOGS_FILE_PATH)) {
      return JSON.parse(fs.readFileSync(LOGS_FILE_PATH, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading analytics_logs.json:', e.message);
  }
  return [];
}

function saveAnalyticsLogs(logs) {
  try {
    // Keep last 5000 view logs to manage file size
    const trimmed = logs.slice(-5000);
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(trimmed, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving analytics_logs.json:', e.message);
  }
}

function parseUserAgent(ua) {
  if (!ua) return { device: 'Desktop', browser: 'Browser', os: 'Unknown' };
  let device = 'Desktop';
  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/ipad|tablet/i.test(ua)) device = 'Tablet';

  let os = 'Unknown OS';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/firefox/i.test(ua)) browser = 'Firefox';

  return { device, browser, os };
}

function recordView(filename, req, clientVisitorId = null) {
  const ua = req.headers['user-agent'] || '';
  // Skip bot / crawler requests (scrapers shouldn't count as human opens)
  if (/bot|crawler|spider|facebook|whatsapp|telegram|slack|linkedin|twitter/i.test(ua)) {
    return;
  }

  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const ip = rawIp.split(',')[0].trim();
  const visitorId = clientVisitorId || `${ip}_${ua.slice(0, 30)}`;
  const { device, browser, os } = parseUserAgent(ua);

  const newLog = {
    id: 'view_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    filename: filename.replace(/[^a-zA-Z0-9._-]/g, '_'),
    timestamp: new Date().toISOString(),
    ip,
    userAgent: ua,
    device,
    browser,
    os,
    visitorId
  };

  const logs = loadAnalyticsLogs();
  logs.push(newLog);
  saveAnalyticsLogs(logs);
  return newLog;
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  // ────────────────────────────────────────────────────────────────
  // API: GET /api/proposal-analytics?filename=...
  // ────────────────────────────────────────────────────────────────
  if (urlPath === '/api/proposal-analytics') {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const targetFilename = parsedUrl.searchParams.get('filename');

    const allLogs = loadAnalyticsLogs();
    const filteredLogs = targetFilename 
      ? allLogs.filter(l => l.filename === targetFilename.replace(/[^a-zA-Z0-9._-]/g, '_'))
      : allLogs;

    const totalViews = filteredLogs.length;
    const uniqueVisitors = new Set(filteredLogs.map(l => l.visitorId || l.ip));
    const uniqueViews = uniqueVisitors.size;
    const duplicateViews = Math.max(0, totalViews - uniqueViews);

    const deviceBreakdown = { Mobile: 0, Desktop: 0, Tablet: 0 };
    filteredLogs.forEach(l => {
      if (deviceBreakdown[l.device] !== undefined) deviceBreakdown[l.device]++;
      else deviceBreakdown.Desktop++;
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      filename: targetFilename,
      totalViews,
      uniqueViews,
      duplicateViews,
      deviceBreakdown,
      logs: filteredLogs.slice(-100).reverse() // Return last 100 recent views
    }));
    return;
  }

  // ────────────────────────────────────────────────────────────────
  // API: POST /api/track-proposal-view
  // ────────────────────────────────────────────────────────────────
  if (req.method === 'POST' && urlPath === '/api/track-proposal-view') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      try {
        const { filename, visitorId } = JSON.parse(body);
        if (filename) {
          recordView(filename, req, visitorId);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // ────────────────────────────────────────────────────────────────
  // DIAGNOSTIC: /debug-proposals
  // ────────────────────────────────────────────────────────────────
  if (urlPath === '/debug-proposals') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    try {
      const coversFiles    = fs.existsSync(COVERS_DIR)    ? fs.readdirSync(COVERS_DIR)    : [];
      const wrappersFiles  = fs.existsSync(WRAPPERS_DIR)  ? fs.readdirSync(WRAPPERS_DIR)  : [];
      const proposalsFiles = fs.existsSync(PROPOSALS_DIR) ? fs.readdirSync(PROPOSALS_DIR) : [];
      const totalLogsCount = loadAnalyticsLogs().length;
      res.end(JSON.stringify({ __dirname, COVERS_DIR, PROPOSALS_DIR, coversFiles, wrappersFiles, proposalsFiles, totalLogsCount }, null, 2));
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
      res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': 'no-cache, no-store, must-revalidate' });
      fs.createReadStream(coverFile).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Cover not found: ' + relativePath);
    }
    return;
  }

  // ────────────────────────────────────────────────────────────────
  // API: POST /api/save-proposal-cover
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

        fs.writeFileSync(path.join(WRAPPERS_DIR, wrapperFile), wrapperHtml, 'utf8');

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

        fs.writeFileSync(path.join(PROPOSALS_DIR, safeName), htmlContent, 'utf8');

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
  // STATIC FILE SERVING & PERSISTENT PROPOSAL RESOLUTION
  // ────────────────────────────────────────────────────────────────
  let filePath = null;

  if (urlPath.startsWith('/proposals/') && urlPath.endsWith('-card.html')) {
    const wrapperCandidate = path.join(WRAPPERS_DIR, path.basename(urlPath));
    if (fs.existsSync(wrapperCandidate)) filePath = wrapperCandidate;
  }

  if (!filePath && urlPath.startsWith('/proposals/')) {
    const proposalCandidate = path.join(PROPOSALS_DIR, path.basename(urlPath));
    if (fs.existsSync(proposalCandidate) && fs.statSync(proposalCandidate).isFile()) {
      filePath = proposalCandidate;
    }
  }

  if (!filePath) {
    for (const dp of possibleDistPaths) {
      const candidate = path.join(dp, urlPath);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        filePath = candidate;
        break;
      }
    }
  }

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

  const isProposalRequest = urlPath.startsWith('/proposals/') && !urlPath.endsWith('-card.html');
  if (isProposalRequest) {
    // Record view in analytics
    const targetFilename = path.basename(filePath);
    recordView(targetFilename, req);
  }

  const cacheHeader = isProposalRequest 
    ? 'no-cache, no-store, must-revalidate, max-age=0' 
    : 'public, max-age=86400';

  res.writeHead(200, { 
    'Content-Type': contentType,
    'Cache-Control': cacheHeader,
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Analytics API ready. Logs stored at: ${LOGS_FILE_PATH}`);
});
