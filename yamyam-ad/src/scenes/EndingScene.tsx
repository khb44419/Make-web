import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {COLORS, TEXT, VIDEO} from '../config';
import {CX, HOLD_FRAMES, MAX_TEXT_W, SCENES} from '../timeline';
import {BOUNCY, blinkAt, clamp, letterPop, lerp, pop, popSpeed, range, wave} from '../lib/anim';
import {Caption} from '../lib/Caption';
import {MapPin, SpeechBubble} from '../lib/shapes';
import {Yami} from '../Yami';

// 장면 5: 딸기 핑크 + 스프링클 + 얌이 인사 + 가게 이름
const SPRINKLE_COLORS = [COLORS.lemon, COLORS.mint, COLORS.soda, COLORS.vanilla, COLORS.white, COLORS.cherry];
const FALL = VIDEO.height + 280;
const SPRINKLES = Array.from({length: 56}, (_, i) => ({
  x: random(`sx${i}`) * VIDEO.width,
  y0: random(`sy${i}`) * FALL,
  speed: 5 + random(`sv${i}`) * 7,
  rot: random(`sr${i}`) * 360,
  spin: (random(`ss${i}`) - 0.5) * 8,
  len: 30 + random(`sl${i}`) * 18,
  color: SPRINKLE_COLORS[i % SPRINKLE_COLORS.length],
  front: i % 9 === 0,
}));

const Sprinkles: React.FC<{f: number; front: boolean}> = ({f, front}) => (
  <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', left: 0, top: 0}}>
    {SPRINKLES.filter((s) => s.front === front).map((s, i) => {
      const y = (((s.y0 + s.speed * f) % FALL) + FALL) % FALL - 140;
      const k = front ? 1.35 : 1;
      return (
        <rect
          key={i}
          x={(-s.len / 2) * k}
          y={-7 * k}
          width={s.len * k}
          height={14 * k}
          rx={7 * k}
          fill={s.color}
          stroke={COLORS.ink}
          strokeWidth={3}
          transform={`translate(${s.x.toFixed(1)} ${y.toFixed(1)}) rotate(${(s.rot + s.spin * f).toFixed(1)})`}
        />
      );
    })}
  </svg>
);

const RISE = {damping: 9, stiffness: 120, mass: 0.9};
const YAMI = {x: 360, y: 1660, height: 680};

export const EndingScene: React.FC<{f: number}> = ({f}) => {
  const holdFrom = SCENES.ending.dur - HOLD_FRAMES; // 이후로 글자는 멈춤
  const [bigName, ...restName] = TEXT.storeName;

  // 얌이: 아래에서 통통 튀어 올라와 손 흔들기
  const rise = pop(f, 0, RISE);
  const stretch = clamp(popSpeed(f, 0, RISE) * 2.4, -0.2, 0.24);
  const hopT = f - 24;
  const hopping = hopT >= 0 && hopT < 30;
  const hop = hopping ? Math.sin(((hopT % 15) / 15) * Math.PI) : 0;
  const squash = hopping ? (1 - hop) ** 6 * 0.14 : 0;
  const waveAmp = f < holdFrom ? 24 : 18;
  const armR = lerp(35, -62 + wave(f, 14) * waveAmp, range(f, 4, 14));

  const tag = pop(f, 28, BOUNCY);
  const pinDrop = (1 - pop(f, 31, BOUNCY)) * -140;
  const bubble = pop(f, 37, BOUNCY);

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: COLORS.pink}}>
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.2) 11px, transparent 12px), radial-gradient(rgba(255,255,255,0.12) 7px, transparent 8px)',
          backgroundSize: '110px 110px, 110px 110px',
          backgroundPosition: `${f * 0.6}px ${f * 1.2}px, ${55 + f * 0.6}px ${55 + f * 1.2}px`,
        }}
      />
      <AbsoluteFill
        style={{background: `radial-gradient(circle at ${YAMI.x}px 1250px, rgba(255,244,214,0.55) 0px, rgba(255,244,214,0) 460px)`}}
      />
      <Sprinkles f={f} front={false} />

      <Yami
        x={YAMI.x}
        y={YAMI.y + (1 - rise) * 900 - hop * 46}
        height={YAMI.height}
        sx={1 - stretch * 0.5 + squash}
        sy={1 + stretch - squash}
        rotate={wave(f, 40) * 3}
        blink={blinkAt(f, 64)}
        armL={36 + wave(f, 30) * 5}
        armR={armR}
        sparkle={wave(f, 10) * 0.5 + 0.5}
      />

      <Caption
        text={bigName}
        x={CX}
        y={410}
        size={240}
        maxWidth={MAX_TEXT_W}
        fill={COLORS.cherry}
        tilt={-5}
        fx={letterPop(f, 4, 3.5)}
      />
      {restName.map((line, i) => (
        <Caption
          key={i}
          text={line}
          x={CX}
          y={612 + i * 120}
          size={104}
          maxWidth={MAX_TEXT_W}
          fill={COLORS.soda}
          tilt={-3}
          fx={letterPop(f, 10 + i * 8, 1.8)}
        />
      ))}

      {tag > 0.001 && (
        <div
          style={{
            position: 'absolute',
            left: CX,
            top: 772 + (restName.length - 1) * 120,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '6px 38px 6px 22px',
            background: COLORS.white,
            border: `7px solid ${COLORS.ink}`,
            borderRadius: 999,
            boxShadow: `0 10px 0 ${COLORS.ink}`,
            transform: `translate(-50%, -50%) rotate(-3deg) scale(${tag})`,
          }}
        >
          <MapPin size={62} style={{transform: `translateY(${pinDrop}px)`}} />
          <Caption inline text={TEXT.city} size={68} maxWidth={420} fill={COLORS.ink} outline={0} shadow={0} />
        </div>
      )}

      <SpeechBubble
        x={630}
        y={950}
        w={470}
        h={150}
        tail={{x: 500, y: 1115}}
        scale={bubble}
        rotate={3 + wave(f, 40) * 1.5 * range(f, holdFrom - 12, holdFrom, 1, 0)}
      >
        <Caption inline text={TEXT.outro} size={68} maxWidth={400} fill={COLORS.ink} outline={0} shadow={0} />
      </SpeechBubble>

      <Sprinkles f={f} front />
    </AbsoluteFill>
  );
};
