// 장면·컷별 가운데 프레임을 PNG로 뽑아 확인하는 스크립트
//   node scripts/check-frames.mjs            → 기본 프레임들
//   node scripts/check-frames.mjs 45 110 449 → 원하는 프레임만
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'out', 'check');
const LOCAL_CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = fs.existsSync(LOCAL_CHROME) ? LOCAL_CHROME : null;

// 기본: 장면1 · 탐험 컷 3개 · 장면3 · 장면4 · 장면5 가운데 + 마지막 프레임 (15초 기준)
const DEFAULT_FRAMES = [45, 110, 150, 190, 255, 330, 405, 449];
const frames = process.argv.slice(2).map(Number).filter((n) => Number.isFinite(n));

const serveUrl = await bundle({
  entryPoint: path.join(root, 'src', 'index.ts'),
  publicDir: path.join(root, 'assets'),
});
const browser = await openBrowser('chrome', {browserExecutable});
const composition = await selectComposition({serveUrl, id: 'YamYamAd', puppeteerInstance: browser});
fs.mkdirSync(outDir, {recursive: true});

for (const frame of frames.length ? frames : DEFAULT_FRAMES) {
  const output = path.join(outDir, `frame-${String(frame).padStart(3, '0')}.png`);
  await renderStill({composition, serveUrl, frame, output, puppeteerInstance: browser, overwrite: true});
  console.log(output);
}
await browser.close({silent: true});
