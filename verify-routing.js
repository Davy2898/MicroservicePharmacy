const http = require('http');
const httpProxy = require('http-proxy');

console.log('Setting up a simple proxy to verify the migration approach...');
console.log('');
console.log('Route mapping:');
console.log('  /api/categories/  -> http://localhost:5001/ (category service)');
console.log('  /api/*            -> http://localhost:5000/ (monolith backend)');
console.log('');

try {
  const proxy = httpProxy.createProxyServer({});
  
  const server = http.createServer(function(req, res) {
    console.log(`${req.method} ${req.url}`);
    
    if (req.url.startsWith('/api/categories/')) {
      console.log('  → Routing to category service (port 5001)');
      proxy.web(req, res, { target: 'http://localhost:5001' });
    } else if (req.url.startsWith('/api/')) {
      console.log('  → Routing to monolith backend (port 5000)');
      proxy.web(req, res, { target: 'http://localhost:5000' });
    } else {
      console.log('  → Not an API request, returning 404');
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found\n');
    }
  });

  proxy.on('error', function(err, req, res) {
    console.log('Proxy error:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error\n');
  });

  server.listen(8080, function() {
    console.log('Proxy server listening on port 8080');
    console.log('');
    console.log('Test endpoints:');
    console.log('  Categories: http://localhost:8080/api/categories/');
    console.log('  Medicines:  http://localhost:8080/api/medicines');
    console.log('');
    console.log('Press Ctrl+C to stop');
  });
} catch (err) {
  console.log('http-proxy module not installed, installing...');
  const { exec } = require('child_process');
  exec('npm install http-proxy', (error, stdout, stderr) => {
    if (error) {
      console.log(`Error: ${error.message}`);
      return;
    }
    console.log('http-proxy installed, please run the script again');
    process.exit(0);
  });
}
