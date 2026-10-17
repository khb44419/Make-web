import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, SHADES, VIDEO} from './config';
import {CX, DRIP, IRIS, PUSH, SCENES} from './timeline';
import {easeInOut, lerp, range} from './lib/anim';
import {FontGate} from './lib/font';
import {BlurFilter, blurStyle, starPoints, toPath, toPolygon} from './lib/shapes';
import {StoreTour} from './scenes/StoreTour';
import {CardsScene} from './scenes/CardsScene';
import {NoOwnerScene} from './scenes/NoOwnerScene';
import {EndingScene} from './scenes/EndingScene';

// ─── 장면 사이 전환 모양 ─────────────────────────────────────
// 장면2→3: 별 모양 구멍이 커지며 다음 장면이 열림
const STAR_C = {x: CX, y: 1000};
const starAt = (t: number) => {
  const R = 30 + t ** 2.2 * 2600;
  return starPoints(STAR_C.x, STAR_C.y, R, R * 0.5, 5, -90 + t * 70);
};

const StarRim: React.FC<{t: number}> = ({t}) => (
  <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', left: 0, top: 0}}>
    <path d={toPath(starAt(t))} fill="none" stroke={COLORS.ink} strokeWidth={44} strokeLinejoin="round" />
    <path d={toPath(starAt(t))} fill="none" stroke={COLORS.white} strokeWidth={24} strokeLinejoin="round" />
  </svg>
);

// 장면4→5: 딸기 아이스크림이 위에서 녹아 흘러내림
const DRIPS = [
  {x: 80, w: 110, L: 260},
  {x: 250, w: 90, L: 390},
  {x: 430, w: 130, L: 210},
  {x: 610, w: 100, L: 340},
  {x: 780, w: 120, L: 250},
  {x: 960, w: 100, L: 370},
];
const dripClip = (t: number, offset: number) => {
  const base = lerp(-470, VIDEO.height + 60, t ** 1.5) + offset;
  const pts: [number, number][] = [
    [0, -20],
    [VIDEO.width, -20],
  ];
  for (let x = VIDEO.width; x >= 0; x -= 8) {
    let y = base + Math.sin(x / 60 + 1.3) * 22;
    for (const d of DRIPS) {
      const dx = Math.abs(x - d.x);
      const r = d.w / 2;
      const L = d.L * (0.6 + 0.4 * t);
      if (dx < r) y = Math.max(y, base + L - r + Math.sqrt(r * r - dx * dx));
      else if (dx < r + 26) y = Math.max(y, base + (L - r) * (1 - (dx - r) / 26) ** 2);
    }
    pts.push([x, y]);
  }
  return toPolygon(pts);
};

export const YamYamAd: React.FC = () => {
  const f = useCurrentFrame();
  const {cards, noOwner, ending} = SCENES;
  const iris = range(f, cards.from - IRIS.pre, cards.from + IRIS.post);
  const push = range(f, noOwner.from - PUSH / 2, noOwner.from + PUSH / 2, 0, 1, easeInOut);
  const pushBlur = Math.sin(Math.PI * push) * 46;
  const drip = range(f, ending.from - DRIP.pre, ending.from + DRIP.post);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.ink}}>
      <FontGate>
        <BlurFilter id="push-blur" x={pushBlur} y={0} />

        {f < cards.from + IRIS.post && <StoreTour f={f} />}

        {f >= cards.from - IRIS.pre && f < noOwner.from + PUSH / 2 && (
          <AbsoluteFill
            style={{
              clipPath: iris < 1 ? toPolygon(starAt(iris)) : undefined,
              transform: `translateX(${-push * VIDEO.width}px)`,
              ...blurStyle('push-blur', pushBlur, 0),
            }}
          >
            <CardsScene f={f - cards.from} />
          </AbsoluteFill>
        )}
        {iris > 0 && iris < 1 && <StarRim t={iris} />}

        {f >= noOwner.from - PUSH / 2 && f < ending.from + DRIP.post && (
          <AbsoluteFill
            style={{
              transform: `translateX(${(1 - push) * VIDEO.width}px)`,
              ...blurStyle('push-blur', pushBlur, 0),
            }}
          >
            <NoOwnerScene f={f - noOwner.from} />
          </AbsoluteFill>
        )}

        {f >= ending.from - DRIP.pre && (
          <>
            {drip < 1 && <AbsoluteFill style={{clipPath: dripClip(drip, 26), backgroundColor: SHADES.pinkDeep}} />}
            <AbsoluteFill style={{clipPath: drip < 1 ? dripClip(drip, 0) : undefined}}>
              <EndingScene f={f - ending.from} />
            </AbsoluteFill>
          </>
        )}
      </FontGate>
    </AbsoluteFill>
  );
};
