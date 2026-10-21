import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const styleFiles = ['styles.css', 'brand.css', 'simulation.css'];
const scriptFiles = ['deck.js', 'simulation.js'];
const [html, ...sources] = await Promise.all(['index.html', ...styleFiles, ...scriptFiles].map(file => readFile(path.join(root, file), 'utf8')));
const css = sources.slice(0, styleFiles.length).join('\n');
const js = sources.slice(styleFiles.length).join('\n;\n');
const slides = html.match(/<section class="slide\b/g) || [];
if (slides.length !== 10) throw new Error(`Esperados 10 slides. Encontrados: ${slides.length}`);
let result = html;
for (const file of styleFiles) {
  result = result.replace(`<link rel="stylesheet" href="${file}">`, '');
}
for (const file of scriptFiles) {
  result = result.replace(`<script src="${file}" defer></script>`, '');
}
const imagePaths = [...new Set([...result.matchAll(/<img\b[^>]*\bsrc=["'](assets\/[^"']+)["']/g)].map(match => match[1]))];
const mimeTypes = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' };
const images = new Map(await Promise.all(imagePaths.map(async asset => {
  const mime = mimeTypes[path.extname(asset).toLowerCase()];
  if (!mime) throw new Error(`Formato de imagem não suportado: ${asset}`);
  const bytes = await readFile(path.join(root, asset));
  return [asset, `data:${mime};base64,${bytes.toString('base64')}`];
})));
result = result
  .replace(/(<img\b[^>]*\bsrc=["'])(assets\/[^"']+)(["'])/g, (_, before, asset, after) => `${before}${images.get(asset)}${after}`)
  .replace('</head>', `<style>\n${css}\n</style>\n</head>`)
  .replace('</body>', `<script>\n${js.replace(/<\/script/gi, '<\\/script')}\n</script>\n</body>`);
await mkdir(path.join(root, 'dist'), { recursive: true });
await writeFile(path.join(root, 'dist/index.html'), result);
console.log(`dist/index.html gerado: 10 slides, CSS, JavaScript e ${images.size} imagens incorporados, sem dependências de rede.`);
