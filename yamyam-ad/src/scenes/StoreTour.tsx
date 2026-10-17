import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, PHOTO, TEXT, VIDEO} from '../config';
import {SCENES, WHIP, cutEnd, cutStart} from '../timeline';
import {BOUNCY, SNAPPY, blinkAt, clamp, easeIn, easeInOut, lerp, pop, popSpeed, range, wave} from '../lib/anim';
import {Cam, CamKey, StorePhoto, camAt, clampCam, lookAt, motionBlur, toPhoto, toScreen} from '../lib/camera';
import {Caption} from '../lib/Caption';
import {BlurFilter, Gem, Magnifier, Sparkle, SpeechBubble, blurStyle, twinkle} from '../lib/shapes';
import {Sticker} from '../lib/Sticker';
import {Yami} from '../Yami';

// 장면 1 (여기 뭐야?!) + 장면 2 (보물 창고 탐험)
// 한 장의 가게 사진 위를 카메라가 계속 움직이고, 컷 사이는 휙 넘어감
const {intro, explore} = SCENES;
const cutOf = (i: number) => PHOTO.cuts[i % PHOTO.cuts.length];
const midZoom = (i: number) => (cutOf(i).zoom[0] + cutOf(i).zoom[1]) / 2;

// 걸어 들어가는 줌인: 천천히 시작해서 끝까지 멈추지 않고 다음 컷으로 이어짐
const walk = (t: number) => 0.45 * t + 0.55 * t * t * (3 - 2 * t);

const KEYS: CamKey[] = [
  {f: 0, cam: lookAt(PHOTO.aisle.x + 40, PHOTO.aisle.y + 40, 1)},
  {f: intro.to - WHIP / 2, cam: lookAt(PHOTO.aisle.x, PHOTO.aisle.y, PHOTO.aisle.zoom), ease: walk},
  ...TEXT.zones.flatMap((_, i): CamKey[] => [
    {f: cutStart(i) + WHIP / 2, cam: lookAt(cutOf(i).look.x, cutOf(i).look.y, cutOf(i).zoom[0]), ease: easeInOut},
    {f: cutEnd(i) - WHIP / 2, cam: lookAt(cutOf(i).look.x, cutOf(i).look.y, cutOf(i).zoom[1])},
  ]),
];

// 장면 1에서는 걸음에 맞춰 카메라가 살짝 출렁임
const cameraAt = (f: number): Cam => {
  const cam = camAt(KEYS, f);
  const step = range(f, 0, intro.to - WHIP, 1, 0);
  return clampCam({...cam, x0: cam.x0 + wave(f, 30) * 2.5 * step, y0: cam.y0 + wave(f, 15) * 4 * step});
};

export const StoreTour: React.FC<{f: number}> = ({f}) => {
  const cam = cameraAt(f);
  const blur = motionBlur(cam, cameraAt(f - 1));
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#5B6378'}}>
      <BlurFilter id="tour-blur" x={blur.x} y={blur.y} />
      <AbsoluteFill style={blurStyle('tour-blur', blur.x, blur.y)}>
        <StorePhoto cam={cam} />
        {TEXT.zones.map((label, i) =>
          f >= cutStart(i) && f < cutEnd(i) ? <CutMarks key={i} i={i} f={f} cam={cam} label={label} /> : null,
        )}
      </AbsoluteFill>
      {f < intro.to && <IntroCast f={f} />}
      {f >= explore.from && <SquadBadge f={f - explore.from} />}
    </AbsoluteFill>
  );
};

// ─── 장면 1: 얌이가 빼꼼 + 말풍선 + 물음표 ─────────────────────
const MARKS = [
  {x: 400, y: 1090, size: 118, color: COLORS.soda, at: 14, rot: -14},
  {x: 215, y: 760, size: 92, color: COLORS.lemon, at: 21, rot: 12},
  {x: 690, y: 1150, size: 112, color: COLORS.mint, at: 28, rot: 16},
  {x: 840, y: 640, size: 100, color: COLORS.pink, at: 35, rot: -10},
  {x: 450, y: 590, size: 84, color: COLORS.cherry, at: 43, rot: 8},
  {x: 830, y: 1060, size: 92, color: COLORS.lemon, at: 51, rot: -16},
  {x: 470, y: 1310, size: 86, color: COLORS.soda, at: 59, rot: 10},
];
const MARK_LIFE = 24;
const PEEK = {damping: 10, stiffness: 140, mass: 0.8};

const IntroCast: React.FC<{f: number}> = ({f}) => {
  const end = intro.dur;
  const peek = pop(f, 1, PEEK);
  const stretch = clamp(popSpeed(f, 1, PEEK) * 3, -0.22, 0.22);
  const hide = range(f, end - 14, end - 4, 0, 1, easeIn);
  const bubble = pop(f, 10, BOUNCY) * range(f, end - 16, end - 10, 1, 0);
  return (
    <>
      <Yami
        x={lerp(-330, 95, peek) - hide * 480}
        y={1190 + wave(f, 40) * 8}
        anchor="head"
        height={760}
        rotate={50 + wave(f, 50) * 4}
        sx={1 + stretch}
        sy={1 - stretch * 0.7}
        blink={blinkAt(f, 60, 25)}
        sparkle={wave(f, 12) * 0.5 + 0.5}
      />
      <SpeechBubble x={560} y={870} w={600} h={210} tail={{x: 215, y: 1150}} scale={bubble} rotate={-3 + wave(f, 45) * 1.5}>
        <Caption
          inline
          text={TEXT.intro}
          size={104}
          maxWidth={520}
          fill={(ch) => ('?!'.includes(ch) ? COLORS.cherry : COLORS.ink)}
          outline={0}
          shadow={0}
        />
      </SpeechBubble>
      {MARKS.map((m, i) => {
        const life = f - m.at;
        if (life < 0 || life > MARK_LIFE) return null;
        const p = pop(life, 0, BOUNCY) * range(life, MARK_LIFE - 6, MARK_LIFE, 1, 0, easeIn);
        return (
          <Caption
            key={i}
            text="?"
            x={m.x}
            y={m.y - life * 1.8}
            size={m.size}
            fill={m.color}
            tilt={m.rot + wave(life, 16) * 10}
            fx={() => ({scale: p})}
          />
        );
      })}
    </>
  );
};

// ─── 장면 2: 손전등 동그라미 + 스티커 (사진에 붙어서 같이 움직임) ──
const DIM = '#140C18'; // 동그라미 바깥을 살짝 어둡게 (색이 물들지 않는 중립색)

const CutMarks: React.FC<{i: number; f: number; cam: Cam; label: string}> = ({i, f, cam, label}) => {
  const cut = cutOf(i);
  const hold = cutStart(i) + WHIP / 2;
  const g = f - hold; // 0 = 카메라가 도착한 순간
  const last = i === TEXT.zones.length - 1;
  const fade = range(f, cutStart(i), hold + 2) * (last ? 1 : range(f, cutEnd(i) - WHIP / 2, cutEnd(i), 1, 0));
  const c = toScreen(cam, cut.spot);
  const r = cut.spot.r * cam.s;
  const ring = pop(g, -2, SNAPPY);
  const rest = lookAt(cut.look.x, cut.look.y, midZoom(i));
  const st = toScreen(cam, toPhoto(rest, cut.sticker));
  const slap = pop(g, 2, {damping: 11, stiffness: 260, mass: 0.7});
  const gradId = `spot-${i}`;
  return (
    <>
      <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <radialGradient id={gradId} cx={c.x} cy={c.y} r={r * 1.9} gradientUnits="userSpaceOnUse">
            <stop offset={0.5} stopColor={DIM} stopOpacity={0} />
            <stop offset={0.62} stopColor={DIM} stopOpacity={0.2 * fade} />
            <stop offset={1} stopColor={DIM} stopOpacity={0.38 * fade} />
          </radialGradient>
        </defs>
        <rect width={VIDEO.width} height={VIDEO.height} fill={`url(#${gradId})`} />
        <g transform={`translate(${c.x} ${c.y}) scale(${lerp(1.35, 1, ring)})`} opacity={fade * clamp(ring * 2)}>
          <circle r={r} fill="none" stroke={COLORS.white} strokeWidth={24} opacity={0.25} />
          <circle
            r={r}
            fill="none"
            stroke={COLORS.white}
            strokeWidth={9}
            strokeDasharray="34 24"
            strokeDashoffset={-f * 3}
            strokeLinecap="round"
          />
        </g>
      </svg>
      {[0, 1, 2, 3].map((k) => {
        const ang = ((-50 + k * 95 + i * 30) * Math.PI) / 180;
        return (
          <Sparkle
            key={k}
            x={c.x + Math.cos(ang) * r}
            y={c.y + Math.sin(ang) * r}
            size={k % 2 ? 56 : 80}
            color={k === 1 ? COLORS.lemon : COLORS.white}
            rotate={f * 2}
            scale={twinkle(g, 24, k * 0.27) * fade}
          />
        );
      })}
      <Sticker
        x={st.x}
        y={st.y}
        tilt={cut.sticker.tilt + (1 - slap) * 14 + wave(g, 40) * 1.2}
        color={cut.color}
        text={label}
        icon={cut.icon}
        scale={slap > 0.001 ? lerp(1.7, 1, slap) : 0}
        opacity={clamp(slap * 3)}
      />
    </>
  );
};

// ─── 장면 2: 왼쪽 위 "얌얌 탐험대" 배지 + 찾은 보물 표시 ──────────
const SquadBadge: React.FC<{f: number}> = ({f}) => {
  const p = pop(f, 0, BOUNCY);
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 64,
        top: 268,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 24px 8px 12px',
        background: COLORS.lemon,
        border: `8px solid ${COLORS.white}`,
        borderRadius: 999,
        boxShadow: `0 10px 0 ${COLORS.ink}`,
        transformOrigin: '0 50%',
        transform: `translateX(${(1 - p) * -560}px) rotate(${-3 + wave(f, 50)}deg)`,
      }}
    >
      <Magnifier size={74} />
      <Caption inline text={TEXT.squad} size={52} maxWidth={340} fill={COLORS.ink} outline={0} shadow={0} />
      <div style={{display: 'flex', gap: 2, marginLeft: 6}}>
        {TEXT.zones.map((_, i) => (
          <Gem key={i} size={54} color={cutOf(i).color} lit={pop(f + explore.from, cutStart(i) + WHIP / 2 + 3, BOUNCY)} />
        ))}
      </div>
    </div>
  );
};
