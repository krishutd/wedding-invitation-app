// Keep the original raster alpha, but paint the gold inside a standalone SVG.
// An <img> then has no CSS mask/background fill for forced-dark to reinterpret.
import { readFile, writeFile } from 'node:fs/promises';
const assets = new URL('../public/assets/', import.meta.url);
for (const [source, output, width, height, mime] of [
  ['couple-calligraphy-bride-final.png', 'couple-calligraphy-bride-gold.svg', 2172, 724, 'image/png'],
  ['couple-calligraphy-groom-final.png', 'couple-calligraphy-groom-gold.svg', 2172, 724, 'image/png'],
  ['ganesha-seal-engraving.webp', 'ganesha-seal-gold.svg', 1254, 1254, 'image/webp'],
]) {
  const data = (await readFile(new URL(source, assets))).toString('base64');
  await writeFile(new URL(output, assets), `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><filter id="gold" color-interpolation-filters="sRGB"><feFlood flood-color="#cdb38b"/><feComposite in2="SourceAlpha" operator="in"/></filter></defs>
  <image width="${width}" height="${height}" href="data:${mime};base64,${data}" filter="url(#gold)"/>
</svg>\n`);
}
