import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, SHADES, TEXT, VIDEO} from '../config';
import {CX, MAX_TEXT_W} from '../timeline';
import {BOUNCY, SOFT, clamp, letterPop, lerp, pop, wave} from '../lib/anim';
import {Caption} from '../lib/Caption';
import {HoloCard, Sparkle, twinkle} from '../lib/shapes';

// 장면 3: 레몬색 햇살 + 무지개빛 카드가 부채꼴로 촤르륵
const FAN = {x: CX, y: 1590, radius: 455, w: 300, h: 430, angles: [-30, -15, 0, 15, 30]};
const STACK = [0, 4, 1, 3, 2]; // 가운데 카드가 맨 위

const SPARKLES = [
  {x: 150, y: 930, size: 70, color: COLORS.white, phase: 0},
  {x: 880, y: 960, size: 60, color: COLORS.white, phase: 0.35},
  {x: 110, y: 1320, size: 54, color: COLORS.pink, phase: 0.6},
  {x: 930, y: 1360, size: 76, color: COLORS.white, phase: 0.15},
  {x: 250, y: 800, size: 46, color: COLORS.soda, phase: 0.8},
  {x: 760, y: 790, size: 52, color: COLORS.pink, phase: 0.5},
];

export const CardsScene: React.FC<{f: number}> = ({f}) => {
  const lines = TEXT.cardsTitle;
  let y = 292;
  const titles = lines.map((line, i) => {
    const last = i === lines.length - 1;
    const size = last ? 150 : 112;
    y += size * 0.6;
    const cy = y;
    y += size * 0.6 + 8;
    return (
      <Caption
        key={i}
        text={line}
        x={CX}
        y={cy + wave(f, 50, i * 0.3) * 4}
        size={size}
        maxWidth={MAX_TEXT_W}
        fill={last ? COLORS.cherry : COLORS.soda}
        tilt={-4}
        fx={letterPop(f, 2 + i * 9, last ? 2.2 : 1.5)}
      />
    );
  });
  const sub = pop(f, 20, BOUNCY);
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.lemon, overflow: 'hidden'}}>
      <Sunburst f={f} x={CX} y={1120} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${CX}px 1150px, rgba(255, 244, 214, 0.95) 0px, rgba(255, 244, 214, 0) 560px)`,
        }}
      />
      <Fan f={f} />
      {SPARKLES.map((s, i) => (
        <Sparkle key={i} x={s.x} y={s.y} size={s.size} color={s.color} rotate={f * 1.5} scale={twinkle(f, 30, s.phase)} />
      ))}
      {titles}
      {sub > 0.001 && (
        <div
          style={{
            position: 'absolute',
            left: CX,
            top: y + 70,
            padding: '12px 34px',
            background: COLORS.ink,
            borderRadius: 999,
            border: `6px solid ${COLORS.white}`,
            transform: `translate(-50%, -50%) rotate(-2deg) scale(${lerp(0.4, 1, sub)}) translateY(${wave(f, 44) * 3}px)`,
            opacity: clamp(sub * 3),
          }}
        >
          <Caption inline text={TEXT.cardsSub} size={52} maxWidth={MAX_TEXT_W - 90} fill={COLORS.white} outline={0} shadow={0} />
        </div>
      )}
    </AbsoluteFill>
  );
};

const Sunburst: React.FC<{f: number; x: number; y: number}> = ({f, x, y}) => {
  const n = 22;
  const R = 2600;
  const d = Array.from({length: n}, (_, i) => {
    const a0 = (i * 2 * Math.PI) / n;
    const a1 = a0 + Math.PI / n;
    return `M0 0 L${(R * Math.cos(a0)).toFixed(1)} ${(R * Math.sin(a0)).toFixed(1)} L${(R * Math.cos(a1)).toFixed(1)} ${(R * Math.sin(a1)).toFixed(1)} Z`;
  }).join(' ');
  return (
    <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', left: 0, top: 0}}>
      <g transform={`translate(${x} ${y}) rotate(${f * 0.45})`}>
        <path d={d} fill={SHADES.lemonLight} />
      </g>
    </svg>
  );
};

const Fan: React.FC<{f: number}> = ({f}) => {
  const rise = pop(f, 0, SOFT);
  return (
    <>
      {STACK.map((i) => {
        const spread = pop(f, 8 + i * 2.5, BOUNCY);
        const angle = (FAN.angles[i] + wave(f, 60, i * 0.2) * 2) * spread;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: FAN.x - FAN.w / 2,
              top: FAN.y - FAN.radius - FAN.h / 2 + (1 - rise) * 1300,
              width: FAN.w,
              height: FAN.h,
              transformOrigin: `${FAN.w / 2}px ${FAN.radius + FAN.h / 2}px`,
              transform: `rotate(${angle}deg)`,
            }}
          >
            <HoloCard f={f} i={i} w={FAN.w} h={FAN.h} />
          </div>
        );
      })}
    </>
  );
};
