import {ENDING_HOLD_SECONDS, FPS, SAFE, SCENE_SECONDS, TEXT, VIDEO} from './config';

// 장면 시작·끝 프레임은 config.ts의 장면 길이(초)에서 계산
const ORDER = ['intro', 'explore', 'cards', 'noOwner', 'ending'] as const;
type SceneName = (typeof ORDER)[number];
type Span = {from: number; dur: number; to: number};

export const SCENES = {} as Record<SceneName, Span>;
let acc = 0;
for (const name of ORDER) {
  const dur = Math.round(SCENE_SECONDS[name] * FPS);
  SCENES[name] = {from: acc, dur, to: acc + dur};
  acc += dur;
}
export const TOTAL_FRAMES = acc;
export const HOLD_FRAMES = Math.round(ENDING_HOLD_SECONDS * FPS);

// 장면 2 컷 경계
const cutLen = SCENES.explore.dur / TEXT.zones.length;
export const cutStart = (i: number) => SCENES.explore.from + Math.round(i * cutLen);
export const cutEnd = (i: number) => cutStart(i + 1);

// 전환 길이 (프레임)
export const WHIP = 8; // 사진 컷 사이 휙 넘기기 (경계 앞뒤로 절반씩)
export const IRIS = {pre: 6, post: 4}; // 장면2→3 별 모양으로 열기
export const PUSH = 12; // 장면3→4 옆으로 밀기
export const DRIP = {pre: 8, post: 6}; // 장면4→5 핑크가 녹아 흘러내리기

// 안전 영역 안의 가로 중심과 최대 글자 폭
export const CX = (SAFE.left + VIDEO.width - SAFE.right) / 2;
export const MAX_TEXT_W = VIDEO.width - SAFE.right - SAFE.left - 30;
