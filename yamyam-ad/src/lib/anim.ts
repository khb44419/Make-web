import {Easing, interpolate, spring} from 'remotion';
import {FPS} from '../config';

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// f가 a→b 구간을 지나는 동안 from→to (구간 밖은 고정)
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing?: (t: number) => number) =>
  interpolate(f, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const easeInOut = Easing.inOut(Easing.cubic);
export const easeIn = Easing.in(Easing.quad);

// 통통 튀는 스프링 모음
export type SpringCfg = {damping: number; stiffness: number; mass: number};
export const BOUNCY: SpringCfg = {damping: 9, stiffness: 170, mass: 0.7};
export const SNAPPY: SpringCfg = {damping: 13, stiffness: 300, mass: 0.8};
export const SOFT: SpringCfg = {damping: 16, stiffness: 120, mass: 0.9};

export const pop = (f: number, delay = 0, config: SpringCfg = BOUNCY) =>
  spring({frame: f - delay, fps: FPS, config});

// 스프링이 움직이는 속도 — 말랑하게 늘었다 줄어드는 효과에 사용
export const popSpeed = (f: number, delay = 0, config: SpringCfg = BOUNCY) =>
  pop(f, delay, config) - pop(f - 1, delay, config);

export const wave = (f: number, period: number, phase = 0) => Math.sin((f / period + phase) * Math.PI * 2);

// 눈 깜빡임 (0 = 뜸, 1 = 감음) — every 프레임마다 6프레임 동안
export const blinkAt = (f: number, every = 70, offset = 0) => {
  const t = (((f + offset) % every) + every) % every;
  if (t < 2) return t / 2;
  if (t < 4) return 1;
  if (t < 6) return 1 - (t - 4) / 2;
  return 0;
};

// 한 글자씩 튀어나오기 (Caption의 fx에 사용)
export const letterPop = (f: number, start: number, stagger: number, cfg: SpringCfg = BOUNCY) => (i: number) => {
  const p = pop(f, start + i * stagger, cfg);
  return {
    scale: p,
    y: (1 - p) * 50,
    rotate: (1 - p) * (i % 2 === 0 ? -24 : 24),
    opacity: clamp(p * 4),
  };
};
