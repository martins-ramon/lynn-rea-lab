import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = process.argv[2] === 'dist' ? path.join(root, 'dist') : root;
const allowed = new Map([
  ['/', ['index.html', 'text/html']],
  ['/index.html', ['index.html', 'text/html']],
  ...['styles.css', 'brand.css', 'simulation.css'].map(file => [`/${file}`, [file, 'text/css']]),
  ...['deck.js', 'simulation.js'].map(file => [`/${file}`, [file, 'text/javascript']]),
  ...['foundation_lynn_logo.png', 'totvs-logo-transparente.png', 'totvs-logo_black.png', 'notebook-rea.png'].map(file => [`/assets/${file}`, [`assets/${file}`, 'image/png']]),
]);
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = allowed.get(pathname);
  if (!file) { res.writeHead(404); res.end('Não encontrado'); return; }
  try {
    const contents = await readFile(path.join(output, file[0]));
    const contentType = file[1].startsWith('text/') ? `${file[1]}; charset=utf-8` : file[1];
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
    res.end(contents);
  } catch {
    res.writeHead(404); res.end('Arquivo não encontrado. Para prévia de dist, execute npm run build.');
  }
}).listen(port, '127.0.0.1', () => console.log(`Apresentação em http://127.0.0.1:${port}`));
