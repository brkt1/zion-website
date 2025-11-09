const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;
const BUILD_DIR = path.join(__dirname, '../build');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(BUILD_DIR, req.url === '/' ? '/index.html' : req.url);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(BUILD_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for React Router
      filePath = path.join(BUILD_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Remove query string for extension detection
    const urlPath = req.url.split('?')[0];
    const urlExt = path.extname(urlPath).toLowerCase();

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      // Set cache headers BEFORE writing response
      const headers = {
        'Content-Type': contentType,
      };

      // Check for JS/CSS files (including chunked files)
      if (ext === '.js' || ext === '.css' || urlExt === '.js' || urlExt === '.css' || req.url.match(/\.(js|css)(\?|$)/)) {
        headers['Cache-Control'] = 'public, max-age=31536000, immutable';
        headers['X-Content-Type-Options'] = 'nosniff';
      } else if (ext.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/) || urlExt.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
        headers['Cache-Control'] = 'public, max-age=31536000, immutable';
      } else if (filePath.endsWith('index.html') || req.url === '/' || req.url.split('?')[0] === '/index.html') {
        headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
      }

      res.writeHead(200, headers);
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Production server running at:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://0.0.0.0:${PORT}\n`);
  console.log('✅ Cache headers enabled for optimal performance');
  console.log('📊 Test with Lighthouse in Incognito mode\n');
});

