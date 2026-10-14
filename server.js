/**
 * API mục tiêu dành cho bài Lab 8 - Kiểm thử hiệu năng với JMeter.
 * Được viết bằng Node.js thuần (không dependencies) để dễ dàng khởi chạy.
 */

const http = require('http');

const PORT = 3000;

// Cơ sở dữ liệu mẫu trong bộ nhớ
let users = [
  { id: 1, name: 'Nguyen Van A', email: 'vana@example.com' },
  { id: 2, name: 'Tran Thi B', email: 'thib@example.com' },
  { id: 3, name: 'Le Van C', email: 'vanc@example.com' }
];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;

  // Log request để theo dõi tải
  console.log(`[${new Date().toISOString()}] ${method} ${url.pathname}`);

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Route: /api/health
  if (url.pathname === '/api/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP', timestamp: new Date() }));
    return;
  }

  // Route: /api/users
  if (url.pathname === '/api/users') {
    if (method === 'GET') {
      // Giả lập độ trễ cơ sở dữ liệu (50ms) để đo lường hiệu năng
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
      }, 50);
      return;
    }

    if (method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (!data.name || !data.email) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Name and email are required' }));
            return;
          }

          const newUser = {
            id: users.length + 1,
            name: data.name,
            email: data.email
          };
          users.push(newUser);

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newUser));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        }
      });
      return;
    }
  }

  // 404 Not Found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Target API Server đang chạy tại http://localhost:${PORT}`);
  console.log(`- GET  http://localhost:${PORT}/api/health (Health check)`);
  console.log(`- GET  http://localhost:${PORT}/api/users  (Lấy ds users - trễ 50ms)`);
  console.log(`- POST http://localhost:${PORT}/api/users  (Tạo user mới)`);
  console.log(`==================================================`);
});
