import React, {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

export const FONT_FAMILY = 'Jua';

const widths = new Map<string, number>();
let ctx: CanvasRenderingContext2D | null = null;

// 글자 폭 (100px 기준) — 폰트가 로드된 뒤에만 정확함
export const advance100 = (ch: string) => {
  let w = widths.get(ch);
  if (w === undefined) {
    ctx ??= document.createElement('canvas').getContext('2d');
    if (!ctx) throw new Error('canvas를 쓸 수 없어요');
    ctx.font = `100px ${FONT_FAMILY}`;
    w = ctx.measureText(ch).width;
    widths.set(ch, w);
  }
  return w;
};

// assets/fonts/Jua-Regular.ttf를 불러온 뒤에 화면을 그림 (글자 폭 계산이 폰트에 맞도록)
export const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [handle] = useState(() => delayRender('Jua 폰트 불러오는 중'));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const face = new FontFace(FONT_FAMILY, `url('${staticFile('fonts/Jua-Regular.ttf')}') format('truetype')`);
    face
      .load()
      .then((loaded) => {
        document.fonts.add(loaded);
        widths.clear();
        setReady(true);
      })
      .catch((err) => cancelRender(err));
  }, []);

  useEffect(() => {
    if (ready) continueRender(handle);
  }, [ready, handle]);

  return ready ? <>{children}</> : null;
};
