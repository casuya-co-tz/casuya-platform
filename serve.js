const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = parseInt(process.argv[2] || "5173");
const ROOT = path.resolve(__dirname, "frontend");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".wasm": "application/wasm",
};

function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

http.createServer((req, res) => {
  setCORS(res);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  let urlPath = req.url.split("?")[0];
  if (urlPath === "/") urlPath = "index.html";

  let filePath = path.join(ROOT, urlPath);

  // If path ends with /, try index.html
  if (urlPath.endsWith("/")) {
    filePath = path.join(filePath, "index.html");
  }

  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback: if the request looks like a page navigation (no extension
      // or .html), serve index.html so client-side routing can handle it.
      const isPageNav = !ext || ext === ".html";
      if (isPageNav && req.method === "GET") {
        const indexPath = path.join(ROOT, "index.html");
        fs.readFile(indexPath, (err2, indexData) => {
          if (err2) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not found");
          } else {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(indexData);
          }
        });
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
      }
    } else {
      const contentType = MIME[ext] || "application/octet-stream";
      // Cache static assets for 1 hour, HTML files no-cache
      const cacheControl = ext === ".html"
        ? "no-cache"
        : "public, max-age=3600";
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
      });
      res.end(data);
    }
  });
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Static server on http://0.0.0.0:${PORT}`);
  console.log(`Serving files from ${ROOT}`);
});
