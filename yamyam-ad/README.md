# 얌얌 아이스크림 할인점 · 15초 세로 광고

"얌얌 탐험대" 콘셉트의 1080×1920 / 30fps / 15초(450프레임) H.264 영상 (소리 없음). [Remotion](https://www.remotion.dev)(React)으로 만들었어요.

- 결과물: `out/yamyam_ad.mp4`, 마지막 장면 캡처 `out/thumbnail.png`
- 재료: `assets/store.jpg`(가게 사진), `assets/fonts/Jua-Regular.ttf`(구글 폰트 주아, SIL OFL)
- 사진 외 그래픽(얌이, 말풍선, 스티커, 아이콘)은 모두 코드(SVG/CSS)로 그렸어요.

## 고치기

문구 · 색 · 장면 길이는 **`src/config.ts` 맨 위 1~3번**에 모여 있어요.

```ts
export const TEXT = {
  intro: '여기 뭐야?!',
  zones: ['아이스크림 천국', '과자 산', '젤리 숲'],
  ...
```

글자가 길어져도 안전 영역(위 250px · 아래 500px · 오른쪽 150px 제외) 안에 들어가도록 글자 크기가 자동으로 줄어들어요.

## 명령어

Node.js 18 이상이 필요해요.

```bash
npm install          # 처음 한 번
npm run studio       # 브라우저에서 미리보기 (고친 내용이 바로 반영)
npm run build        # out/yamyam_ad.mp4 + out/thumbnail.png 다시 만들기
node scripts/check-frames.mjs   # 장면별 가운데 프레임을 out/check/에 PNG로 저장
```
