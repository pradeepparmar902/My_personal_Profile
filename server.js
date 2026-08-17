const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

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

// ── Analytics & GPS Neighborhood Geolocation ───────────────────────────────
const ipGeoCache = new Map();

function normalizeFilename(fn) {
  if (!fn) return '';
  return fn.toLowerCase().replace(/\.html?$/i, '').replace(/[^a-z0-9]/g, '');
}

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

// Fast GeoIP Lookup
function fetchGeoLocation(ip, req, callback) {
  const cfCity    = req.headers['cf-ipcity'];
  const cfCountry = req.headers['cf-ipcountry'];
  if (cfCity || cfCountry) {
    callback({ city: cfCity || 'Mumbai', region: 'Maharashtra', country: cfCountry || 'India', countryCode: cfCountry || 'IN', neighborhood: '' });
    return;
  }

  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    callback({ city: 'Mumbai', region: 'Maharashtra', country: 'India', countryCode: 'IN', neighborhood: '' });
    return;
  }

  if (ipGeoCache.has(ip)) {
    callback(ipGeoCache.get(ip));
    return;
  }

  const reqUrl = `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city`;
  http.get(reqUrl, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.status === 'success') {
          const loc = {
            city: json.city || 'Mumbai',
            region: json.regionName || 'Maharashtra',
            country: json.country || 'India',
            countryCode: json.countryCode || 'IN',
            neighborhood: ''
          };
          ipGeoCache.set(ip, loc);
          callback(loc);
          return;
        }
      } catch (e) {}
      const fallback = { city: 'Mumbai', region: 'Maharashtra', country: 'India', countryCode: 'IN', neighborhood: '' };
      ipGeoCache.set(ip, fallback);
      callback(fallback);
    });
  }).on('error', () => {
    callback({ city: 'Mumbai', region: 'Maharashtra', country: 'India', countryCode: 'IN', neighborhood: '' });
  });
}

// Reverse Geocode GPS Coordinates to Neighborhood
function reverseGeocodeGps(lat, lon, callback) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  const options = {
    headers: { 'User-Agent': 'PradeepParmarProposals/1.0' }
  };
  https.get(url, options, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json && json.address) {
          const addr = json.address;
          const neighborhood = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || addr.subdistrict || addr.city_district || '';
          const city = addr.city || addr.town || addr.county || 'Mumbai';
          const state = addr.state || 'Maharashtra';
          const country = addr.country || 'India';
          callback({ neighborhood, city, region: state, country });
          return;
        }
      } catch (e) {}
      callback(null);
    });
  }).on('error', () => callback(null));
}

function recordView(filename, req, clientVisitorId = null, gpsCoords = null, engagement = null) {
  const ua = req.headers['user-agent'] || '';
  if (/bot|crawler|spider|facebook|whatsapp|telegram|slack|linkedin|twitter/i.test(ua)) {
    return;
  }

  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const ip = rawIp.split(',')[0].trim();
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const targetNorm = normalizeFilename(safeFilename);
  const visitorId = clientVisitorId || `${ip}_${ua.slice(0, 30)}`;
  const { device, browser, os } = parseUserAgent(ua);

  const logs = loadAnalyticsLogs();
  const now = Date.now();

  // Deduplication check (last 60 seconds)
  let targetLog = null;
  for (let i = logs.length - 1; i >= 0; i--) {
    const l = logs[i];
    const logTime = new Date(l.timestamp).getTime();
    if (normalizeFilename(l.filename) === targetNorm && (l.visitorId === visitorId || l.ip === ip) && (now - logTime) < 60000) {
      targetLog = l;
      break;
    }
  }

  if (targetLog) {
    if (clientVisitorId) targetLog.visitorId = clientVisitorId;
    if (engagement) {
      if (engagement.timeSpentSeconds) {
        targetLog.timeSpentSeconds = Math.max(targetLog.timeSpentSeconds || 0, Math.round(engagement.timeSpentSeconds));
      }
      if (engagement.maxScrollPercent) {
        targetLog.maxScrollPercent = Math.max(targetLog.maxScrollPercent || 0, Math.round(engagement.maxScrollPercent));
      }
    }
  } else {
    targetLog = {
      id: 'view_' + now + '_' + Math.random().toString(36).substr(2, 5),
      filename: safeFilename,
      timestamp: new Date(now).toISOString(),
      ip,
      userAgent: ua,
      device,
      browser,
      os,
      visitorId,
      timeSpentSeconds: engagement ? Math.round(engagement.timeSpentSeconds || 0) : 0,
      maxScrollPercent: engagement ? Math.round(engagement.maxScrollPercent || 0) : 0,
      location: { city: 'Mumbai', region: 'Maharashtra', country: 'India', countryCode: 'IN', neighborhood: '' }
    };
    logs.push(targetLog);
  }

  saveAnalyticsLogs(logs);

  // 1. IP Geolocation
  fetchGeoLocation(ip, req, (ipLoc) => {
    targetLog.location = { ...targetLog.location, ...ipLoc };
    saveAnalyticsLogs(logs);

    // 2. Reverse Geocode GPS if available
    if (gpsCoords && gpsCoords.lat && gpsCoords.lon) {
      reverseGeocodeGps(gpsCoords.lat, gpsCoords.lon, (gpsLoc) => {
        if (gpsLoc) {
          targetLog.location.neighborhood = gpsLoc.neighborhood || targetLog.location.neighborhood;
          if (gpsLoc.city) targetLog.location.city = gpsLoc.city;
          saveAnalyticsLogs(logs);
        }
      });
    }
  });

  return targetLog;
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
    const targetNorm = normalizeFilename(targetFilename);

    let filteredLogs = targetFilename 
      ? allLogs.filter(l => {
          const lNorm = normalizeFilename(l.filename);
          return lNorm === targetNorm || (lNorm.length >= 3 && targetNorm.includes(lNorm)) || (targetNorm.length >= 3 && lNorm.includes(targetNorm));
        })
      : allLogs;

    // Fallback: If filtered matching returns 0 but allLogs has entries, display allLogs
    if (filteredLogs.length === 0 && allLogs.length > 0) {
      filteredLogs = allLogs;
    }

    const totalViews = filteredLogs.length;
    const uniqueVisitors = new Set(filteredLogs.map(l => l.visitorId || l.ip));
    const uniqueViews = uniqueVisitors.size;
    const duplicateViews = Math.max(0, totalViews - uniqueViews);

    const deviceBreakdown = { Mobile: 0, Desktop: 0, Tablet: 0 };
    const locationBreakdown = {};

    let totalDuration = 0;
    let totalScroll = 0;
    let highInterestCount = 0;

    filteredLogs.forEach(l => {
      if (deviceBreakdown[l.device] !== undefined) deviceBreakdown[l.device]++;
      else deviceBreakdown.Desktop++;

      if (l.location) {
        const areaStr = l.location.neighborhood 
          ? `${l.location.neighborhood}, ${l.location.city}` 
          : `${l.location.city || 'Mumbai'}, ${l.location.country || 'India'}`;
        locationBreakdown[areaStr] = (locationBreakdown[areaStr] || 0) + 1;
      }

      const dur = l.timeSpentSeconds || 0;
      const scr = l.maxScrollPercent || 0;

      totalDuration += dur;
      totalScroll += scr;

      if (dur >= 120 || scr >= 75) {
        highInterestCount++;
      }
    });

    const avgTimeSpentSeconds = totalViews > 0 ? Math.round(totalDuration / totalViews) : 0;
    const avgScrollPercent    = totalViews > 0 ? Math.round(totalScroll / totalViews) : 0;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      filename: targetFilename,
      totalViews,
      uniqueViews,
      duplicateViews,
      avgTimeSpentSeconds,
      avgScrollPercent,
      highInterestCount,
      deviceBreakdown,
      locationBreakdown,
      logs: filteredLogs.slice(-100).reverse()
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
        const { filename, visitorId, lat, lon, timeSpentSeconds, maxScrollPercent } = JSON.parse(body || '{}');
        if (filename) {
          const gpsCoords = (lat && lon) ? { lat, lon } : null;
          const engagement = (timeSpentSeconds || maxScrollPercent) ? { timeSpentSeconds, maxScrollPercent } : null;
          recordView(filename, req, visitorId, gpsCoords, engagement);
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
  // SERVE cover images + DYNAMIC WRAPPERS WITH 404 FALLBACK PROTECTION
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
      return;
    }

    // Dynamic Wrapper Generator Fallback if disk wrapper was reset by host deploy!
    if (relativePath.startsWith('wrappers/')) {
      const wrapperName = path.basename(relativePath);
      const baseName    = wrapperName.replace(/-card\.html$/i, '');
      const safeName    = baseName + '.html';

      const proto = getProto(req);
      const host  = getHost(req);
      const actualUrl  = `${proto}://${host}/proposals/${safeName}`;
      const wrapperUrl = `${proto}://${host}/covers/wrappers/${wrapperName}`;
      const coverUrl   = `${proto}://${host}/covers/${baseName}-cover.jpg`;
      const title      = baseName.replace(/_/g, ' ').toUpperCase();

      const dynamicHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<meta name="description" content="Interactive Executive Proposal"/>
<meta property="og:type" content="article"/>
<meta property="og:site_name" content="Pradeep Parmar"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="Interactive Executive Proposal featuring audio recordings, video clips, and modules."/>
<meta property="og:image" content="${coverUrl}"/>
<meta property="og:url" content="${wrapperUrl}"/>
<meta name="twitter:card" content="summary_large_image"/>
</head>
<body style="background:#0a0a0a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;">
<div>
<h1 style="font-size:1.6rem;color:#fff;margin-bottom:8px;">${title}</h1>
<p style="color:#aaa;max-width:480px;margin:0 auto 24px;">Interactive Executive Proposal</p>
<a href="${actualUrl}" style="display:inline-block;background:#d4af37;color:#000;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;">Open Proposal →</a>
</div>
<script>
  var ua = (navigator.userAgent||'').toLowerCase();
  if (!/bot|crawler|spider|facebook|whatsapp|telegram|slack|linkedin|twitter/i.test(ua)) {
    window.location.replace('${actualUrl}');
  }
</script>
</body>
</html>`;

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(dynamicHtml);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Cover not found: ' + relativePath);
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
  // API: POST /api/upload-proposal
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
  // STATIC FILE SERVING & ENGAGEMENT + DIRECT FIREBASE CLOUD TRACKING
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

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  const isProposalRequest = urlPath.startsWith('/proposals/') && !urlPath.endsWith('-card.html');

  if (isProposalRequest) {
    const targetFilename = path.basename(filePath);
    recordView(targetFilename, req);

    fs.readFile(filePath, 'utf8', (err, htmlContent) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Error');
        return;
      }

      const engagementTrackingScript = `
<script>
(function() {
  var fn = ${JSON.stringify(targetFilename)};
  var vKey = 'pp_vid_' + fn;
  var vid = localStorage.getItem(vKey) || ('v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
  localStorage.setItem(vKey, vid);

  var startTime = Date.now();
  var totalActiveSeconds = 0;
  var maxScroll = 0;
  var isVisible = true;

  function updateScroll() {
    var h = document.documentElement, b = document.body;
    var st = 'scrollTop' in h ? h.scrollTop : b.scrollTop;
    var sh = 'scrollHeight' in h ? h.scrollHeight : b.scrollHeight;
    var ch = h.clientHeight;
    var percent = Math.round((st / Math.max(1, (sh - ch))) * 100);
    if (percent > maxScroll) maxScroll = Math.min(100, Math.max(0, percent));
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  var timer = setInterval(function() {
    if (isVisible) totalActiveSeconds += 3;
    if (totalActiveSeconds % 12 === 0 || totalActiveSeconds === 3) {
      sendHeartbeat();
    }
  }, 3000);

  document.addEventListener('visibilitychange', function() {
    isVisible = !document.hidden;
    if (document.hidden) sendHeartbeat();
  });

  function sendHeartbeat(lat, lon) {
    try {
      var payload = JSON.stringify({
        filename: fn,
        visitorId: vid,
        lat: lat || null,
        lon: lon || null,
        timeSpentSeconds: totalActiveSeconds,
        maxScrollPercent: maxScroll
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track-proposal-view', payload);
      } else {
        fetch('/api/track-proposal-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        }).catch(function(){});
      }

      // Direct Firebase Cloud Firestore REST Backup
      var fsUrl = 'https://firestore.googleapis.com/v1/projects/my-personal-profile-96791/databases/(default)/documents/proposal_analytics_logs';
      var ua = navigator.userAgent || '';
      var dev = /mobile/i.test(ua)?'Mobile':/ipad|tablet/i.test(ua)?'Tablet':'Desktop';
      var br  = /chrome/i.test(ua)?'Chrome':/safari/i.test(ua)?'Safari':'Browser';
      var os  = /windows/i.test(ua)?'Windows':/mac/i.test(ua)?'macOS':/android/i.test(ua)?'Android':/iphone|ipad/i.test(ua)?'iOS':'Linux';
      
      var fsBody = JSON.stringify({
        fields: {
          id: { stringValue: 'view_' + Date.now() + '_' + vid.slice(-4) },
          filename: { stringValue: fn },
          timestamp: { stringValue: new Date().toISOString() },
          visitorId: { stringValue: vid },
          device: { stringValue: dev },
          browser: { stringValue: br },
          os: { stringValue: os },
          ip: { stringValue: 'Client View' },
          timeSpentSeconds: { integerValue: String(totalActiveSeconds) },
          maxScrollPercent: { integerValue: String(maxScroll) }
        }
      });

      fetch(fsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: fsBody
      }).catch(function(){});

    } catch(e){}
  }

  sendHeartbeat(null, null);

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      if (pos && pos.coords) {
        sendHeartbeat(pos.coords.latitude, pos.coords.longitude);
      }
    }, function(){}, { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 });
  }
})();
</script>`;

      let finalHtml = htmlContent;
      if (finalHtml.includes('</body>')) {
        finalHtml = finalHtml.replace('</body>', engagementTrackingScript + '</body>');
      } else {
        finalHtml += engagementTrackingScript;
      }

      res.writeHead(200, { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(finalHtml);
    });
    return;
  }

  res.writeHead(200, { 
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=86400'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
