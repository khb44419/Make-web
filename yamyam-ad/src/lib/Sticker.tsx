import React from 'react';
import {COLORS} from '../config';
import {Caption} from './Caption';
import {ICONS, IconName} from './shapes';

// 흰 테두리를 두른 둥근 스티커
export const Sticker: React.FC<{
  x: number;
  y: number;
  tilt: number;
  color: string;
  text: string;
  icon: IconName;
  scale?: number;
  opacity?: number;
}> = ({x, y, tilt, color, text, icon, scale = 1, opacity = 1}) => {
  if (scale <= 0.001 || opacity <= 0.001) return null;
  const Icon = ICONS[icon];
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 46px 14px 24px',
          background: color,
          border: `12px solid ${COLORS.white}`,
          borderRadius: 999,
          boxShadow: `0 14px 0 ${COLORS.ink}, 0 24px 34px rgba(0, 0, 0, 0.28)`,
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 9,
            width: '40%',
            height: 15,
            borderRadius: 99,
            background: 'rgba(255, 255, 255, 0.38)',
          }}
        />
        <Icon size={112} />
        <Caption
          inline
          text={text}
          size={80}
          maxWidth={600}
          fill={COLORS.white}
          outline={8}
          outlineColor={COLORS.ink}
          shadow={0}
        />
      </div>
    </div>
  );
};
