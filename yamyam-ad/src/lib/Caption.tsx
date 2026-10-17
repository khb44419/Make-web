import React from 'react';
import {COLORS} from '../config';
import {FONT_FAMILY, advance100} from './font';

export type LetterFx = {x?: number; y?: number; scale?: number; rotate?: number; opacity?: number};

type Props = {
  text: string;
  x?: number; // 화면 위치 (글자 덩어리 가운데)
  y?: number;
  size: number; // 글자 크기 (px)
  maxWidth?: number; // 넘치면 글자 크기를 자동으로 줄임
  fill?: string | ((ch: string, i: number) => string);
  outline?: number; // 흰 테두리 두께 (px)
  outlineColor?: string;
  shadow?: number; // 진한 그림자 거리 (px)
  shadowColor?: string;
  tilt?: number; // 기울기 (도)
  spacing?: number; // 글자 간격 (em)
  fx?: (i: number, n: number) => LetterFx; // 글자별 움직임
  inline?: boolean; // 다른 요소 안에 나란히 놓을 때
  style?: React.CSSProperties;
};

// 예능 자막 스타일 글자: 진한 그림자 → 두꺼운 흰 테두리 → 색 글자 순서로 겹쳐 그림
export const Caption: React.FC<Props> = ({
  text,
  x = 0,
  y = 0,
  size: wanted,
  maxWidth,
  fill = COLORS.ink,
  outline: outlineProp,
  outlineColor = COLORS.white,
  shadow: shadowProp,
  shadowColor = COLORS.ink,
  tilt = 0,
  spacing = 0.02,
  fx,
  inline,
  style,
}) => {
  const chars = Array.from(text);
  const adv = chars.map(advance100);
  const width100 = adv.reduce((a, b) => a + b, 0) + spacing * 100 * Math.max(0, chars.length - 1);
  const outlineRatio = (outlineProp ?? wanted * 0.12) / wanted;
  const shadowRatio = (shadowProp ?? wanted * 0.075) / wanted;
  const size = maxWidth ? Math.min(wanted, maxWidth / (width100 / 100 + 2 * outlineRatio)) : wanted;
  const outline = outlineRatio * size;
  const shadow = shadowRatio * size;

  const textW = (width100 * size) / 100;
  const pad = outline + shadow + size * 0.35;
  const W = textW + pad * 2;
  const H = size * 1.2 + pad * 2;
  const baseline = size * 0.36; // Jua 한글의 시각적 가운데 → 글자 기준선까지 거리

  let cursor = pad;
  const letters = chars.map((ch, i) => {
    const w = (adv[i] * size) / 100;
    const cx = cursor + w / 2;
    cursor += w + spacing * size;
    return {ch, i, cx, fx: fx ? fx(i, chars.length) : {}};
  });
  const visible = letters.filter((l) => l.ch.trim() !== '' && (l.fx.opacity ?? 1) > 0.001);

  const place = (l: (typeof letters)[number]) =>
    `translate(${l.cx + (l.fx.x ?? 0)} ${H / 2 + (l.fx.y ?? 0)}) rotate(${l.fx.rotate ?? 0}) scale(${Math.max(0, l.fx.scale ?? 1)})`;
  const colorOf = (ch: string, i: number) => (typeof fill === 'function' ? fill(ch, i) : fill);
  const common = {fontFamily: FONT_FAMILY, fontSize: size, textAnchor: 'middle' as const};

  const box: React.CSSProperties = inline
    ? {position: 'relative', width: textW + outline * 2, height: size * 1.1 + outline * 2, flex: 'none'}
    : {position: 'absolute', left: x - W / 2, top: y - H / 2, width: W, height: H};

  return (
    <div style={{...box, transform: tilt ? `rotate(${tilt}deg)` : undefined, ...style}}>
      <svg
        width={W}
        height={H}
        style={{
          position: 'absolute',
          overflow: 'visible',
          left: inline ? -(pad - outline) : 0,
          top: inline ? -(H - (size * 1.1 + outline * 2)) / 2 : 0,
        }}
      >
        {shadow > 0 &&
          visible.map((l) => (
            <g key={`s${l.i}`} transform={place(l)} opacity={l.fx.opacity ?? 1}>
              <text
                {...common}
                x={shadow * 0.2}
                y={baseline + shadow}
                fill={shadowColor}
                stroke={shadowColor}
                strokeWidth={outline * 2}
                strokeLinejoin="round"
              >
                {l.ch}
              </text>
            </g>
          ))}
        {outline > 0 &&
          visible.map((l) => (
            <g key={`o${l.i}`} transform={place(l)} opacity={l.fx.opacity ?? 1}>
              <text
                {...common}
                y={baseline}
                fill={outlineColor}
                stroke={outlineColor}
                strokeWidth={outline * 2}
                strokeLinejoin="round"
              >
                {l.ch}
              </text>
            </g>
          ))}
        {visible.map((l) => (
          <g key={`f${l.i}`} transform={place(l)} opacity={l.fx.opacity ?? 1}>
            <text {...common} y={baseline} fill={colorOf(l.ch, l.i)}>
              {l.ch}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
