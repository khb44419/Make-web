import React from 'react';
import {COLORS, SHADES} from './config';
import {useSvgId} from './lib/ids';

// 마스코트 "얌이": 와플 콘 위 딸기 아이스크림 한 스쿱 (그림 좌표 400 x 620)
const VB_W = 400;
const VB_H = 620;
const ANCHORS = {
  tip: {x: 200, y: 600}, // 콘 끝
  head: {x: 200, y: 245}, // 스쿱 가운데
};

const INK = COLORS.ink;
const LINE = {fill: INK, stroke: INK, strokeWidth: 14, strokeLinejoin: 'round' as const};

const CONE_D = 'M92 335 L308 335 L214 584 Q200 612 186 584 Z';
const MOUTH_D = 'M166 270 Q200 276 234 270 Q232 318 200 320 Q168 318 166 270 Z';

// 스쿱 = 큰 타원 + 아래쪽 물결 + 흘러내리는 방울 (색은 감싸는 <g>에서 받음)
const Scoop: React.FC = () => (
  <>
    <ellipse cx={200} cy={240} rx={158} ry={145} />
    <circle cx={66} cy={326} r={36} />
    <circle cx={120} cy={358} r={40} />
    <circle cx={186} cy={370} r={40} />
    <circle cx={252} cy={366} r={40} />
    <circle cx={314} cy={342} r={38} />
    <rect x={128} y={350} width={30} height={88} rx={15} />
    <rect x={196} y={370} width={32} height={100} rx={16} />
    <rect x={246} y={360} width={26} height={76} rx={13} />
  </>
);

const SHOULDER_Y = 455;
const Arm: React.FC<{side: 'L' | 'R'; angle: number; mode: 'line' | 'fill'}> = ({side, angle, mode}) => {
  const sx = side === 'R' ? 254 : 146;
  const dir = side === 'R' ? 1 : -1;
  const line = mode === 'line';
  return (
    <g transform={`rotate(${dir * angle} ${sx} ${SHOULDER_Y})`}>
      <rect
        x={side === 'R' ? sx - 10 : sx - 64}
        y={SHOULDER_Y - 15}
        width={74}
        height={30}
        rx={15}
        {...(line ? LINE : {fill: SHADES.cone})}
      />
      <circle
        cx={sx + dir * 70}
        cy={SHOULDER_Y}
        r={21}
        {...(line ? LINE : {fill: COLORS.vanilla, stroke: INK, strokeWidth: 5})}
      />
    </g>
  );
};

const Eye: React.FC<{cx: number; blink: number; sparkle: number}> = ({cx, blink, sparkle}) =>
  blink > 0.75 ? (
    <path d={`M${cx - 22} 236 Q${cx} 212 ${cx + 22} 236`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
  ) : (
    <g transform={`translate(${cx} 228) scale(1 ${1 - blink * 0.9})`}>
      <ellipse rx={25} ry={31} fill={INK} />
      <circle cx={-8} cy={-11} r={9.5 * (1 + 0.18 * sparkle)} fill={COLORS.white} />
      <circle cx={8} cy={10} r={4.5} fill={COLORS.white} />
    </g>
  );

const SPRINKLES: [number, number, number, string][] = [
  [140, 140, 35, COLORS.lemon],
  [166, 112, -25, COLORS.mint],
  [272, 118, 25, COLORS.white],
  [302, 160, 55, COLORS.soda],
  [330, 214, -15, COLORS.lemon],
  [80, 214, 70, COLORS.soda],
  [200, 152, -60, COLORS.vanilla],
];

// 와플 격자 (콘 모양으로 잘라서 사용)
const LATTICE = Array.from({length: 16}, (_, i) => -160 + i * 34);

export type YamiProps = {
  x: number; // 화면 위치 (anchor 기준)
  y: number;
  height: number; // 키 (px)
  anchor?: keyof typeof ANCHORS;
  rotate?: number;
  sx?: number; // 말랑 늘었다 줄었다 (가로·세로 배율)
  sy?: number;
  blink?: number; // 0 = 눈 뜸, 1 = 감음
  armL?: number; // 팔 각도: 0 = 옆으로, + = 아래로, - = 위로
  armR?: number;
  sparkle?: number; // 눈 하이라이트 반짝임 (0~1)
};

export const Yami: React.FC<YamiProps> = ({
  x,
  y,
  height,
  anchor = 'tip',
  rotate = 0,
  sx = 1,
  sy = 1,
  blink = 0,
  armL = 40,
  armR = 40,
  sparkle = 0,
}) => {
  const k = height / VB_H;
  const a = ANCHORS[anchor];
  const grad = useSvgId('scoop');
  const coneClip = useSvgId('cone');
  const mouthClip = useSvgId('mouth');

  return (
    <div
      style={{
        position: 'absolute',
        left: x - a.x * k,
        top: y - a.y * k,
        width: VB_W * k,
        height: VB_H * k,
        transformOrigin: `${a.x * k}px ${a.y * k}px`,
        transform: `rotate(${rotate}deg) scale(${sx}, ${sy})`,
      }}
    >
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={VB_W * k} height={VB_H * k} style={{overflow: 'visible'}}>
        <defs>
          <radialGradient id={grad} cx={150} cy={165} r={290} gradientUnits="userSpaceOnUse">
            <stop offset={0} stopColor={SHADES.pinkLight} />
            <stop offset={0.5} stopColor={COLORS.pink} />
            <stop offset={1} stopColor={SHADES.pinkDeep} />
          </radialGradient>
          <clipPath id={coneClip}>
            <path d={CONE_D} />
          </clipPath>
          <clipPath id={mouthClip}>
            <path d={MOUTH_D} />
          </clipPath>
        </defs>

        {/* 1) 바깥 외곽선 (전체 실루엣을 진한 색으로 한 번에) */}
        <Arm side="L" angle={armL} mode="line" />
        <Arm side="R" angle={armR} mode="line" />
        <path d={CONE_D} {...LINE} />
        <g {...LINE}>
          <Scoop />
        </g>

        {/* 2) 팔 · 콘 */}
        <Arm side="L" angle={armL} mode="fill" />
        <Arm side="R" angle={armR} mode="fill" />
        <path d={CONE_D} fill={SHADES.cone} />
        <g clipPath={`url(#${coneClip})`}>
          {LATTICE.map((c) => (
            <React.Fragment key={c}>
              <line x1={c} y1={320} x2={c + 200} y2={620} stroke={SHADES.coneDark} strokeWidth={6} strokeLinecap="round" />
              <line x1={c + 300} y1={320} x2={c + 100} y2={620} stroke={SHADES.coneDark} strokeWidth={6} strokeLinecap="round" />
            </React.Fragment>
          ))}
          <path d="M200 330 L320 330 L214 590 L200 600 Z" fill={INK} opacity={0.08} />
        </g>

        {/* 3) 딸기 스쿱 */}
        <g fill={`url(#${grad})`}>
          <Scoop />
        </g>
        <ellipse cx={106} cy={170} rx={28} ry={15} fill={COLORS.white} opacity={0.55} transform="rotate(-38 106 170)" />
        {SPRINKLES.map(([sx2, sy2, r, c], i) => (
          <rect
            key={i}
            x={sx2 - 13}
            y={sy2 - 5}
            width={26}
            height={10}
            rx={5}
            fill={c}
            stroke={INK}
            strokeWidth={3}
            transform={`rotate(${r} ${sx2} ${sy2})`}
          />
        ))}

        {/* 4) 얼굴 */}
        <ellipse cx={100} cy={282} rx={24} ry={13} fill={COLORS.cherry} opacity={0.42} />
        <ellipse cx={300} cy={282} rx={24} ry={13} fill={COLORS.cherry} opacity={0.42} />
        <Eye cx={148} blink={blink} sparkle={sparkle} />
        <Eye cx={252} blink={blink} sparkle={sparkle} />
        <path d={MOUTH_D} fill={SHADES.mouth} />
        <ellipse cx={200} cy={316} rx={24} ry={13} fill={SHADES.tongue} clipPath={`url(#${mouthClip})`} />
        <path d={MOUTH_D} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />

        {/* 5) 체리 */}
        <path d="M232 64 C234 42 244 26 262 14" fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" />
        <path d="M232 64 C234 42 244 26 262 14" fill="none" stroke="#7A4A2A" strokeWidth={7} strokeLinecap="round" />
        <path
          d="M258 18 C270 -2 298 0 304 12 C290 26 270 30 258 18 Z"
          fill={COLORS.mint}
          stroke={INK}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <circle cx={226} cy={88} r={30} fill={COLORS.cherry} stroke={INK} strokeWidth={7} />
        <ellipse cx={215} cy={77} rx={9} ry={6} fill={COLORS.white} opacity={0.85} transform="rotate(-30 215 77)" />
      </svg>
    </div>
  );
};
