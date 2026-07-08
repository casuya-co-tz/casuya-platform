const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = parseInt(process.argv[2] || "5173");
const ROOT = path.resolve(__dirname, "frontend");

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

http.createServer((req, res) => {
  let urlPath = req.url === "/" ? "index.html" : req.url;
  let filePath = path.join(ROOT, urlPath);
  // If path ends with /, try index.html
  if (urlPath.endsWith("/")) filePath = path.join(filePath, "index.html");
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
    } else {
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(data);
    }
  });
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Static server on http://0.0.0.0:${PORT}`);
});
