import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, PHOTO, TEXT} from '../config';
import {CX, DRIP, MAX_TEXT_W, PUSH, SCENES} from '../timeline';
import {BOUNCY, SNAPPY, clamp, lerp, pop, range, wave} from '../lib/anim';
import {StorePhoto, lookAt} from '../lib/camera';
import {Caption} from '../lib/Caption';
import {Burst, Sparkle, starPoints, toPath} from '../lib/shapes';

// 장면 4: 가게를 옆으로 훑으며 "사장님 없어요!" 쾅
const SLAM_AT = 2;
const SLAM_Y = 790;
const WAVE_AT = 9;

export const NoOwnerScene: React.FC<{f: number}> = ({f}) => {
  const {dur} = SCENES.noOwner;
  const t = range(f, -PUSH / 2, dur + DRIP.post);
  const cam = lookAt(lerp(PHOTO.pan.fromX, PHOTO.pan.toX, t), PHOTO.pan.y, PHOTO.pan.zoom);

  const slam = pop(f, SLAM_AT, SNAPPY);
  const hit = f - (SLAM_AT + 4); // 글자가 바닥에 닿는 순간
  const shake = hit >= 0 ? Math.exp(-hit / 4) * 22 : 0;
  const sx = Math.sin(f * 2.9) * shake;
  const sy = Math.cos(f * 3.7) * shake;
  const flash = hit >= 0 ? Math.exp(-hit / 2.5) * 0.55 : 0;
  const burst = pop(f, SLAM_AT + 3, BOUNCY);

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: COLORS.ink}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(1.04)`}}>
        <StorePhoto cam={cam} />
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(180deg, rgba(20,12,24,0.08) 0%, rgba(20,12,24,0.42) 28%, rgba(20,12,24,0.42) 62%, rgba(20,12,24,0.06) 100%)',
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${sx * 0.6}px, ${sy * 0.6}px)`}}>
        <Burst
          x={CX}
          y={SLAM_Y}
          w={980}
          h={390}
          color={COLORS.cherry}
          inner={COLORS.pink}
          scale={burst}
          rotate={-5 + f * 0.25}
        />
        <Caption
          text={TEXT.noOwner}
          x={CX}
          y={SLAM_Y}
          size={138}
          maxWidth={MAX_TEXT_W}
          fill={COLORS.lemon}
          tilt={-5}
          fx={() => ({scale: lerp(2.6, 1, slam), opacity: clamp(slam * 4)})}
        />
        <Caption
          text={TEXT.slowly}
          x={CX}
          y={1035}
          size={98}
          maxWidth={MAX_TEXT_W}
          fill={COLORS.mint}
          tilt={-3}
          fx={(i) => {
            const p = pop(f, WAVE_AT + i * 1.4, BOUNCY);
            return {
              scale: p,
              opacity: clamp(p * 4),
              y: (1 - p) * 70 + Math.sin((f - i * 3) / 4.5) * 13 * p,
              rotate: Math.sin((f - i * 3) / 6) * 5 * p,
            };
          }}
        />
        <UnmannedBadge f={f - 19} />
      </AbsoluteFill>
      {flash > 0.01 && <AbsoluteFill style={{backgroundColor: COLORS.white, opacity: flash}} />}
    </AbsoluteFill>
  );
};

// 작은 "무인매장" 도장 배지
const UnmannedBadge: React.FC<{f: number}> = ({f}) => {
  const p = pop(f, 0, {damping: 8, stiffness: 200, mass: 0.6});
  if (p <= 0.001) return null;
  const D = 210;
  return (
    <div
      style={{
        position: 'absolute',
        left: 800 - D / 2,
        top: 572 - D / 2,
        width: D,
        height: D,
        transform: `rotate(${-14 + (1 - p) * 40 + wave(f, 36) * 3}deg) scale(${p})`,
      }}
    >
      <svg width={D} height={D} viewBox="-105 -105 210 210" style={{position: 'absolute', overflow: 'visible'}}>
        <circle r={96} fill={COLORS.ink} transform="translate(0 10)" />
        <circle r={96} fill={COLORS.mint} stroke={COLORS.white} strokeWidth={12} />
        <circle r={74} fill="none" stroke={COLORS.white} strokeWidth={4} strokeDasharray="10 9" />
        <path d={toPath(starPoints(-52, -40, 14, 6))} fill={COLORS.lemon} stroke={COLORS.ink} strokeWidth={3} strokeLinejoin="round" />
        <path d={toPath(starPoints(54, 44, 12, 5))} fill={COLORS.white} stroke={COLORS.ink} strokeWidth={3} strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Caption inline text={TEXT.unmanned} size={50} maxWidth={150} fill={COLORS.ink} outline={0} shadow={0} />
      </div>
      <Sparkle x={D - 6} y={10} size={44} color={COLORS.white} rotate={f * 3} scale={0.4 + 0.6 * Math.abs(wave(f, 20))} />
    </div>
  );
};
