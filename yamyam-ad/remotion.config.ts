import fs from 'node:fs';
import {Config} from '@remotion/cli/config';

Config.setEntryPoint('./src/index.ts');
Config.setPublicDir('./assets'); // assets/store.jpg, assets/fonts/Jua-Regular.ttf

// 세로 1080x1920 · H.264 (표준 yuv420p, BT.709) · 소리 없음
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');
Config.setCrf(18);
Config.setMuted(true);
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);

// 크롬을 내려받을 수 없는 작업 환경이면 미리 설치된 Chromium을 사용
const LOCAL_CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (fs.existsSync(LOCAL_CHROME)) {
  Config.setBrowserExecutable(LOCAL_CHROME);
}
