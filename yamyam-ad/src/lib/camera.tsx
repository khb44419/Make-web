import React from 'react';
import {Img, staticFile} from 'remotion';
import {PHOTO, VIDEO} from '../config';
import {lerp} from './anim';

// 가게 사진을 비추는 가상 카메라: 사진의 (x0, y0)가 화면 왼쪽 위, s = 확대 배율
export type Cam = {x0: number; y0: number; s: number};
type P = {x: number; y: number};

const MARGIN = 40; // 사진 가장자리 여유 (빠른 이동 중 흐림이 끝에서 비지 않도록)
const fit = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)));

export const clampCam = ({x0, y0, s}: Cam): Cam => {
  const z = Math.min(s, PHOTO.maxZoom);
  return {
    s: z,
    x0: fit(x0, MARGIN, PHOTO.width - VIDEO.width / z - MARGIN),
    y0: fit(y0, MARGIN, PHOTO.height - VIDEO.height / z - MARGIN),
  };
};

// 사진의 한 점을 화면 가운데에 두고 s배로 보기
export const lookAt = (x: number, y: number, s: number): Cam =>
  clampCam({s, x0: x - VIDEO.width / s / 2, y0: y - VIDEO.height / s / 2});

export const toScreen = (c: Cam, p: P): P => ({x: (p.x - c.x0) * c.s, y: (p.y - c.y0) * c.s});
export const toPhoto = (c: Cam, p: P): P => ({x: p.x / c.s + c.x0, y: p.y / c.s + c.y0});

export type CamKey = {f: number; cam: Cam; ease?: (t: number) => number};

export const camAt = (keys: CamKey[], f: number): Cam => {
  if (f <= keys[0].f) return keys[0].cam;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (f <= b.f) {
      const t = (b.ease ?? ((v: number) => v))((f - a.f) / (b.f - a.f));
      return clampCam({
        x0: lerp(a.cam.x0, b.cam.x0, t),
        y0: lerp(a.cam.y0, b.cam.y0, t),
        s: Math.exp(lerp(Math.log(a.cam.s), Math.log(b.cam.s), t)),
      });
    }
  }
  return keys[keys.length - 1].cam;
};

// 한 프레임 동안 화면 가운데가 움직인 거리 → 방향별 흐림 세기
export const motionBlur = (now: Cam, before: Cam, k = 0.5, max = 60) => {
  const c = {x: VIDEO.width / 2, y: VIDEO.height / 2};
  const q = toScreen(before, toPhoto(now, c));
  return {x: Math.min(max, Math.abs(c.x - q.x) * k), y: Math.min(max, Math.abs(c.y - q.y) * k)};
};

export const StorePhoto: React.FC<{cam: Cam}> = ({cam}) => (
  <Img
    src={staticFile(PHOTO.file)}
    style={{
      position: 'absolute',
      left: -cam.x0 * cam.s,
      top: -cam.y0 * cam.s,
      width: PHOTO.width * cam.s,
      height: PHOTO.height * cam.s,
      maxWidth: 'none',
    }}
  />
);
