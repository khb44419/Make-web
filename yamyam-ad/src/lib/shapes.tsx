import React from 'react';
import {COLORS, SHADES} from '../config';
import {wave} from './anim';
import {useSvgId} from './ids';

const INK = COLORS.ink;

// ─── 도형 도우미 ────────────────────────────────────────────
type Pt = [number, number];

export const starPoints = (cx: number, cy: number, R: number, r: number, n = 5, rot = -90): Pt[] =>
  Array.from({length: n * 2}, (_, i) => {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    const rad = i % 2 === 0 ? R : r;
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
  });

export const toPath = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} Z`;
export const toPolygon = (pts: Pt[]) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(', ')})`;

// 방향이 있는 흐림 (휙 넘어가는 컷 전환용)
export const BlurFilter: React.FC<{id: string; x: number; y: number}> = ({id, x, y}) => (
  <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
    <defs>
      <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation={`${x.toFixed(2)} ${y.toFixed(2)}`} edgeMode="duplicate" />
      </filter>
    </defs>
  </svg>
);
export const blurStyle = (id: string, x: number, y: number): React.CSSProperties =>
  x + y > 1.5 ? {filter: `url(#${id})`} : {};

// ─── 반짝이 ─────────────────────────────────────────────────
const SPARKLE_D =
  'M0 -1 C0.13 -0.13 0.13 -0.13 1 0 C0.13 0.13 0.13 0.13 0 1 C-0.13 0.13 -0.13 0.13 -1 0 C-0.13 -0.13 -0.13 -0.13 0 -1 Z';

export const Sparkle: React.FC<{
  x: number;
  y: number;
  size: number;
  color?: string;
  rotate?: number;
  scale?: number;
  opacity?: number;
}> = ({x, y, size, color = COLORS.white, rotate = 0, scale = 1, opacity = 1}) =>
  scale <= 0.001 ? null : (
    <svg
      width={size}
      height={size}
      viewBox="-1 -1 2 2"
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        overflow: 'visible',
        transform: `rotate(${rotate}deg) scale(${scale})`,
        opacity,
      }}
    >
      <path d={SPARKLE_D} fill={color} />
    </svg>
  );

// 0→1→0 으로 반짝였다 사라지기를 반복
export const twinkle = (f: number, period: number, phase = 0) => {
  const t = (((f / period + phase) % 1) + 1) % 1;
  return Math.max(0, Math.sin(t * Math.PI * 2)) ** 1.5;
};

// ─── 말풍선 ─────────────────────────────────────────────────
export const SpeechBubble: React.FC<{
  x: number; // 말풍선 가운데
  y: number;
  w: number;
  h: number;
  tail: {x: number; y: number}; // 꼬리 끝 (화면 좌표)
  scale?: number;
  rotate?: number;
  children?: React.ReactNode;
}> = ({x, y, w, h, tail, scale = 1, rotate = 0, children}) => {
  if (scale <= 0.001) return null;
  const left = x - w / 2;
  const top = y - h / 2;
  const tx = tail.x - left;
  const ty = tail.y - top;
  const ang = Math.atan2(ty - h / 2, tx - w / 2);
  const nx = -Math.sin(ang);
  const ny = Math.cos(ang);
  const bx = w / 2 + Math.cos(ang) * h * 0.3;
  const by = h / 2 + Math.sin(ang) * h * 0.3;
  const half = h * 0.2;
  const mx = (bx + tx) / 2;
  const my = (by + ty) / 2;
  const tailD = `M ${bx + nx * half} ${by + ny * half} Q ${mx + nx * half * 0.25} ${my + ny * half * 0.25} ${tx} ${ty} Q ${mx - nx * half * 0.55} ${my - ny * half * 0.55} ${bx - nx * half} ${by - ny * half} Z`;
  const shapes = (p: React.SVGProps<SVGPathElement> & React.SVGProps<SVGRectElement>) => (
    <>
      <path d={tailD} {...p} />
      <rect x={0} y={0} width={w} height={h} rx={h * 0.46} {...p} />
    </>
  );
  const line = {fill: INK, stroke: INK, strokeWidth: 18, strokeLinejoin: 'round' as const};
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: w,
        height: h,
        transformOrigin: `${tx}px ${ty}px`,
        transform: `rotate(${rotate}deg) scale(${scale})`,
      }}
    >
      <svg width={w} height={h} style={{position: 'absolute', overflow: 'visible'}}>
        <g transform="translate(0 12)">{shapes(line)}</g>
        {shapes(line)}
        {shapes({fill: COLORS.white})}
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {children}
      </div>
    </div>
  );
};

// ─── 쾅! 터지는 모양 ────────────────────────────────────────
export const Burst: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  inner: string;
  scale?: number;
  rotate?: number;
  spikes?: number;
}> = ({x, y, w, h, color, inner, scale = 1, rotate = 0, spikes = 14}) => {
  if (scale <= 0.001) return null;
  const pts = (k: number): Pt[] =>
    Array.from({length: spikes * 2}, (_, i) => {
      const a = (i * Math.PI) / spikes - Math.PI / 2;
      const r = i % 2 === 0 ? 1 - ((i * 7) % 5) * 0.035 : 0.72;
      return [(Math.cos(a) * r * w * k) / 2, (Math.sin(a) * r * h * k) / 2];
    });
  return (
    <svg
      width={w}
      height={h}
      viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`}
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        overflow: 'visible',
        transform: `rotate(${rotate}deg) scale(${scale})`,
      }}
    >
      <path d={toPath(pts(1))} fill={INK} stroke={INK} strokeWidth={34} strokeLinejoin="round" transform="translate(6 14)" />
      <path d={toPath(pts(1))} fill={color} stroke={COLORS.white} strokeWidth={16} strokeLinejoin="round" />
      <path d={toPath(pts(0.8))} fill={inner} strokeLinejoin="round" />
    </svg>
  );
};

// ─── 지도 핀 ────────────────────────────────────────────────
export const MapPin: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <svg width={size} height={size * 1.25} viewBox="-50 -58 100 125" style={{overflow: 'visible', ...style}}>
    <ellipse cx={0} cy={62} rx={22} ry={7} fill={INK} opacity={0.25} />
    <path
      d="M0 60 C-10 42 -42 16 -42 -12 C-42 -38 -22 -54 0 -54 C22 -54 42 -38 42 -12 C42 16 10 42 0 60 Z"
      fill={COLORS.cherry}
      stroke={INK}
      strokeWidth={8}
      strokeLinejoin="round"
    />
    <circle cx={0} cy={-12} r={16} fill={COLORS.white} stroke={INK} strokeWidth={6} />
    <path d="M-28 -24 Q-24 -38 -10 -44" stroke={COLORS.white} strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.6} />
  </svg>
);

// ─── 보석 (탐험 진행 표시) ──────────────────────────────────
const GEM_D = 'M-36 -10 L-19 -32 L19 -32 L36 -10 L0 34 Z';
export const Gem: React.FC<{size: number; color: string; lit: number}> = ({size, color, lit}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{overflow: 'visible', flex: 'none'}}>
    <path d={GEM_D} fill="rgba(255,255,255,0.45)" stroke={INK} strokeOpacity={0.45} strokeWidth={6} strokeDasharray="10 8" strokeLinejoin="round" />
    {lit > 0.001 && (
      <g transform={`scale(${lit})`}>
        <path d={GEM_D} fill={color} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d="M-36 -10 L36 -10 M-19 -32 L-8 -10 L0 34 M19 -32 L8 -10 L0 34" fill="none" stroke={COLORS.white} strokeWidth={4} opacity={0.75} strokeLinejoin="round" />
        <path d="M-22 -18 L-14 -27" stroke={COLORS.white} strokeWidth={6} strokeLinecap="round" />
      </g>
    )}
  </svg>
);

// ─── 돋보기 (탐험대 배지) ───────────────────────────────────
export const Magnifier: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{overflow: 'visible', flex: 'none'}}>
    <line x1={12} y1={12} x2={36} y2={36} stroke={INK} strokeWidth={22} strokeLinecap="round" />
    <line x1={12} y1={12} x2={36} y2={36} stroke={COLORS.cherry} strokeWidth={10} strokeLinecap="round" />
    <circle cx={-8} cy={-8} r={28} fill="#E3F4FF" stroke={INK} strokeWidth={18} />
    <circle cx={-8} cy={-8} r={28} fill="#E3F4FF" stroke={COLORS.lemon} strokeWidth={7} />
    <path d="M-24 -12 Q-22 -24 -10 -26" stroke={COLORS.white} strokeWidth={7} strokeLinecap="round" fill="none" />
  </svg>
);

// ─── 스티커 아이콘 ──────────────────────────────────────────
const BAR_D = 'M27 30 Q27 8 50 8 Q73 8 73 30 L73 66 Q73 72 67 72 L33 72 Q27 72 27 66 Z';

const IceBarIcon: React.FC<{size: number}> = ({size}) => {
  const clip = useSvgId('bar');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible', flex: 'none'}}>
      <defs>
        <clipPath id={clip}>
          <path d={BAR_D} />
        </clipPath>
      </defs>
      <rect x={41} y={62} width={18} height={32} rx={9} fill={COLORS.vanilla} stroke={INK} strokeWidth={5} />
      <path d={BAR_D} fill={COLORS.pink} />
      <g clipPath={`url(#${clip})`}>
        <path d="M0 36 Q12 31 25 36 T50 36 T75 36 T100 36 V54 H0 Z" fill={COLORS.lemon} />
        <path d="M0 54 Q12 49 25 54 T50 54 T75 54 T100 54 V80 H0 Z" fill={COLORS.mint} />
      </g>
      <path d={BAR_D} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M34 22 Q35 14 43 12" stroke={COLORS.white} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.85} />
    </svg>
  );
};

const MountainIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible', flex: 'none'}}>
    <line x1={50} y1={24} x2={50} y2={3} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <path d="M50 4 L68 10 L50 16 Z" fill={COLORS.lemon} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path
      d="M6 90 Q6 85 9 81 L41 30 Q50 17 59 30 L91 81 Q94 85 94 90 Z"
      fill={SHADES.cone}
      stroke={INK}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <path
      d="M34 42 L41 30 Q50 17 59 30 L66 42 Q62 49 58 43 Q54 51 50 45 Q46 51 42 43 Q38 49 34 42 Z"
      fill={COLORS.vanilla}
      stroke={INK}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <circle cx={33} cy={68} r={4.5} fill={INK} />
    <circle cx={56} cy={59} r={4} fill={INK} />
    <circle cx={68} cy={76} r={4.5} fill={INK} />
    <circle cx={47} cy={80} r={3.5} fill={INK} />
    <circle cx={22} cy={82} r={3} fill={INK} />
  </svg>
);

const JellyTreeIcon: React.FC<{size: number}> = ({size}) => {
  const crown = (p: React.SVGProps<SVGCircleElement>) => (
    <>
      <circle cx={30} cy={48} r={20} {...p} />
      <circle cx={70} cy={48} r={20} {...p} />
      <circle cx={50} cy={30} r={25} {...p} />
      <circle cx={50} cy={54} r={18} {...p} />
    </>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible', flex: 'none'}}>
      <rect x={42} y={58} width={16} height={34} rx={7} fill={SHADES.cone} stroke={INK} strokeWidth={5} />
      {crown({fill: INK, stroke: INK, strokeWidth: 10})}
      {crown({fill: COLORS.pink})}
      <ellipse cx={40} cy={20} rx={8} ry={5} fill={COLORS.white} opacity={0.75} transform="rotate(-30 40 20)" />
      <ellipse cx={22} cy={42} rx={5} ry={3.5} fill={COLORS.white} opacity={0.7} transform="rotate(-40 22 42)" />
      <circle cx={62} cy={36} r={5} fill={COLORS.lemon} stroke={INK} strokeWidth={2.5} />
      <circle cx={36} cy={56} r={4.5} fill={COLORS.white} stroke={INK} strokeWidth={2.5} />
      <circle cx={72} cy={58} r={4} fill={COLORS.lemon} stroke={INK} strokeWidth={2.5} />
    </svg>
  );
};

export const ICONS = {iceBar: IceBarIcon, mountain: MountainIcon, jellyTree: JellyTreeIcon};
export type IconName = keyof typeof ICONS;

// ─── 무지개빛 카드 ──────────────────────────────────────────
export const HoloCard: React.FC<{f: number; i: number; w: number; h: number}> = ({f, i, w, h}) => {
  const sheen = ((f * 2.2 + i * 30) % 150) - 30;
  const rainbow = `repeating-linear-gradient(125deg, ${COLORS.pink} 0px, ${COLORS.lemon} 70px, ${COLORS.mint} 140px, ${COLORS.soda} 210px, ${SHADES.lavender} 280px, ${COLORS.pink} 350px)`;
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 26,
        background: COLORS.white,
        border: `6px solid ${INK}`,
        padding: 12,
        boxSizing: 'border-box',
        boxShadow: `0 14px 0 rgba(74, 36, 64, 0.35)`,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 16,
          overflow: 'hidden',
          background: rainbow,
          backgroundPosition: `${f * 4 + i * 60}px ${f * 2}px`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(60deg, rgba(255,255,255,0) 0 16px, rgba(255,255,255,0.22) 16px 21px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1.6px, transparent 2.6px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            bottom: '-20%',
            left: `${sheen}%`,
            width: '42%',
            background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.85), rgba(255,255,255,0))',
            transform: 'skewX(-16deg)',
          }}
        />
        <div style={{position: 'absolute', inset: 10, borderRadius: 10, border: '4px solid rgba(255,255,255,0.75)'}} />
        <svg
          viewBox="-100 -100 200 200"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: w * 0.66,
            height: w * 0.66,
            overflow: 'visible',
            transform: `translate(-50%, -50%) rotate(${wave(f, 40, i / 5) * 7}deg) scale(${1 + 0.06 * wave(f, 22, i / 3)})`,
            filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.95))',
          }}
        >
          <path d={toPath(starPoints(0, 8, 92, 42))} fill={COLORS.white} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
          <path d={toPath(starPoints(0, 8, 46, 21))} fill={COLORS.lemon} strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};
