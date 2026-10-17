import {useId} from 'react';

// SVG url(#id)에 안전한 고유 id
export const useSvgId = (name: string) => `${name}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
