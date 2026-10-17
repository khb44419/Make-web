// ============================================================
//  얌얌 아이스크림 할인점 · 15초 세로 광고 — 설정 파일
//
//  문구 · 색 · 장면 길이는 이 파일 맨 위 1~3번만 고치면
//  영상 전체에 반영돼요.
//    미리보기:   npm run studio
//    다시 만들기: npm run build   (out/yamyam_ad.mp4 + out/thumbnail.png)
// ============================================================

// ─── 1. 문구 ────────────────────────────────────────────────
export const TEXT = {
  // 장면 1 (0~3초) 얌이 말풍선
  intro: '여기 뭐야?!',

  // 장면 2 (3~7초) 보물 창고 탐험
  squad: '얌얌 탐험대', // 왼쪽 위 작은 배지
  zones: ['아이스크림 천국', '과자 산', '젤리 숲'], // 컷 순서대로 붙는 스티커

  // 장면 3 (7~10초) 카드
  cardsTitle: ['요즘 핫한 카드도', '있다고?!'], // 큰 글씨 — 한 칸이 한 줄
  cardsSub: '포켓몬 카드부터 요즘 유행템까지', // 작은 글씨

  // 장면 4 (10~12초)
  noOwner: '사장님 없어요!',
  slowly: '내 맘대로 천천히~',
  unmanned: '무인매장', // 작은 배지

  // 장면 5 (12~15초) 엔딩
  storeName: ['얌얌', '아이스크림 할인점'], // 첫 줄 크게, 둘째 줄 작게
  city: '대구',
  outro: '오늘은 뭐 먹지?',
};

// ─── 2. 색 ──────────────────────────────────────────────────
export const COLORS = {
  pink: '#FF6FA5', // 딸기 핑크
  vanilla: '#FFF4D6', // 바닐라
  mint: '#5ED6C1', // 민트
  soda: '#4DA3FF', // 소다 블루
  lemon: '#FFD43B', // 레몬
  cherry: '#E8392F', // 체리 레드
  ink: '#4A2440', // 글자 그림자 · 외곽선 (진한 베리 초콜릿)
  white: '#FFFFFF',
};

// ─── 3. 장면 길이 (초) — 합계가 영상 길이 (기본 15초 = 450프레임) ───
export const FPS = 30;
export const SCENE_SECONDS = {
  intro: 3, // 여기 뭐야?!
  explore: 4, // 보물 창고 탐험 (컷들이 똑같이 나눠 씀)
  cards: 3, // 요즘 핫한 카드
  noOwner: 2, // 사장님 없어요!
  ending: 3, // 엔딩
};
export const ENDING_HOLD_SECONDS = 1; // 엔딩 끝에서 글자가 멈춰 있는 시간

// ─── 4. 세부 설정 (보통은 안 고쳐도 돼요) ─────────────────────
export const VIDEO = {width: 1080, height: 1920};

// 릴스·쇼츠 버튼과 설명글에 가리는 영역 — 중요한 글자는 이 안쪽에만 둬요
export const SAFE = {top: 250, bottom: 500, right: 150, left: 60};

// 그림에만 쓰는 보조색
export const SHADES = {
  pinkLight: '#FF9CC4',
  pinkDeep: '#EC4D8B',
  lemonLight: '#FFE680',
  cone: '#EDBB7E',
  coneDark: '#C98A4E',
  mouth: '#8E1F45',
  tongue: '#FF9EC0',
  lavender: '#B59CFF',
};

// 가게 사진 (assets/store.jpg) — 좌표는 원본 사진 픽셀 기준
export const PHOTO = {
  file: 'store.jpg',
  width: 1512,
  height: 2016,
  maxZoom: 1.35, // 원본보다 이 배율 이상은 확대하지 않음 (흐려짐 방지)
  // 장면 1: 통로 안쪽으로 걸어 들어가는 줌인
  aisle: {x: 520, y: 930, zoom: 1.35},
  // 장면 2: 탐험 컷 (zones 문구와 같은 순서)
  //   look = 카메라가 볼 곳, spot = 손전등 동그라미, sticker = 스티커 화면 위치
  cuts: [
    {
      look: {x: 250, y: 1420},
      zoom: [1.25, 1.33],
      spot: {x: 185, y: 1460, r: 250},
      sticker: {x: 470, y: 760, tilt: -6},
      color: COLORS.soda,
      icon: 'iceBar',
    },
    {
      look: {x: 220, y: 980},
      zoom: [1.25, 1.33],
      spot: {x: 185, y: 1030, r: 240},
      sticker: {x: 520, y: 1310, tilt: 5},
      color: COLORS.cherry,
      icon: 'mountain',
    },
    {
      look: {x: 1230, y: 1030},
      zoom: [1.25, 1.33],
      spot: {x: 1255, y: 1045, r: 265},
      sticker: {x: 400, y: 590, tilt: -4},
      color: COLORS.mint,
      icon: 'jellyTree',
    },
  ],
  // 장면 4: 옆으로 천천히 훑기
  pan: {fromX: 520, toX: 1000, y: 1010, zoom: 1.03},
} as const;
