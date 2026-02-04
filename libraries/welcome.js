import { DOMImplementation, XMLSerializer } from 'xmldom';
import JsBarcode from 'jsbarcode';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, '..', 'src');

const _svg = fs.readFileSync(join(src, 'welcome.svg'), 'utf-8');

const barcode = (data) => {
  const xmlSerializer = new XMLSerializer();
  const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
  const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  JsBarcode(svgNode, data, {
    xmlDocument: document,
  });

  return xmlSerializer.serializeToString(svgNode);
};

const imageSetter = (img, value) => img && img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', value);
const textSetter = (el, value) => el && (el.textContent = value);

const { document: svg } = new JSDOM(_svg).window;

/**
 * Generate SVG Welcome
 */
const genSVG = async ({
  wid = '',
  pp = join(src, 'avatar_contact.png'),
  title = '',
  name = '',
  text = '',
  background = '',
} = {}) => {
  const barcodeBase64 = toBase64(await toImg(barcode(wid.replace(/[^0-9]/g, '')), 'png'), 'image/png');
  const el = {
    code: ['#_1661899539392 > g:nth-child(6) > image', imageSetter, barcodeBase64],
    pp: ['#_1661899539392 > g:nth-child(3) > image', imageSetter, pp],
    text: ['#_1661899539392 > text.fil1.fnt0', textSetter, text],
    title: ['#_1661899539392 > text.fil2.fnt1', textSetter, title],
    name: ['#_1661899539392 > text.fil2.fnt2', textSetter, name],
    bg: ['#_1661899539392 > g:nth-child(2) > image', imageSetter, background],
  };
  for (const [selector, set, value] of Object.values(el)) {
    set(svg.querySelector(selector), value);
  }
  return svg.body.innerHTML;
};

const toImg = async (svg, format = 'png') => {
  if (!svg) return Buffer.allocUnsafe(0);
  try {
    return await sharp(Buffer.from(svg))
      .toFormat(format === 'jpg' ? 'jpeg' : format)
      .toBuffer();
  } catch (e) {
    console.error('Sharp error:', e);
    return Buffer.allocUnsafe(0);
  }
};

const toBase64 = (buffer, mime) => `data:${mime};base64,${buffer.toString('base64')}`;

/**
 * Render SVG Welcome
 */
const render = async ({
  wid = '',
  pp,
  name = '',
  title = '',
  text = '',
  background,
} = {}, format = 'png') => {
  if (!pp) pp = toBase64(await fs.promises.readFile(join(src, 'avatar_contact2.png')), 'image/png');
  if (!background) background = toBase64(await fs.promises.readFile(join(src, 'avatar_contact.png')), 'image/png'); // Fixed path

  const svgStr = await genSVG({
    wid, pp, name, text, background, title,
  });
  return await toImg(svgStr, format);
};

export default render;
