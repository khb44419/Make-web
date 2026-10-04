// scripts/fetch_photos.py 가 자동으로 만든 파일 (직접 고치지 마세요)
const PHOTOS = {
 "cover:osaka": {
  "src": "images/p001.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E9%81%93%E9%A0%93%E5%A0%80",
  "title": "道頓堀"
 },
 "cover:nagoya": {
  "src": "images/p002.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E7%99%BD%E5%B7%9D%E9%83%B7%E3%83%BB%E4%BA%94%E7%AE%87%E5%B1%B1%E3%81%AE%E5%90%88%E6%8E%8C%E9%80%A0%E3%82%8A%E9%9B%86%E8%90%BD",
  "title": "白川郷・五箇山の合掌造り集落"
 },
 "osaka:오사카성": {
  "src": "images/p003.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E5%A4%A7%E5%9D%82%E5%9F%8E",
  "title": "大坂城"
 },
 "osaka:도톤보리": {
  "src": "images/p004.jpg",
  "page": "https://en.wikipedia.org/wiki/D%C5%8Dtonbori",
  "title": "Dōtonbori"
 },
 "osaka:유니버설 스튜디오 재팬": {
  "src": "images/p005.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%83%A6%E3%83%8B%E3%83%90%E3%83%BC%E3%82%B5%E3%83%AB%E3%83%BB%E3%82%B9%E3%82%BF%E3%82%B8%E3%82%AA%E3%83%BB%E3%82%B8%E3%83%A3%E3%83%91%E3%83%B3",
  "title": "ユニバーサル・スタジオ・ジャパン"
 },
 "osaka:우메다 스카이빌딩": {
  "src": "images/p006.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E6%A2%85%E7%94%B0%E3%82%B9%E3%82%AB%E3%82%A4%E3%83%93%E3%83%AB",
  "title": "梅田スカイビル"
 },
 "osaka:신세카이 · 츠텐카쿠": {
  "src": "images/p007.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E9%80%9A%E5%A4%A9%E9%96%A3",
  "title": "通天閣"
 },
 "osaka:가이유칸 수족관": {
  "src": "images/p008.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E6%B5%B7%E9%81%8A%E9%A4%A8",
  "title": "海遊館"
 },
 "osaka:타코야키 와나카": {
  "src": "images/p009.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%81%9F%E3%81%93%E7%84%BC%E3%81%8D",
  "title": "たこ焼き"
 },
 "osaka:오코노미야키 미즈노": {
  "src": "images/p010.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%81%8A%E5%A5%BD%E3%81%BF%E7%84%BC%E3%81%8D",
  "title": "お好み焼き"
 },
 "osaka:킨류 라멘": {
  "src": "images/p011.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E9%87%91%E9%BE%8D%E3%83%A9%E3%83%BC%E3%83%A1%E3%83%B3",
  "title": "金龍ラーメン"
 },
 "osaka:551 호라이 본점": {
  "src": "images/p012.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E8%93%AC%E8%90%8A_(%E9%A3%B2%E9%A3%9F%E5%BA%97)",
  "title": "蓬萊 (飲食店)"
 },
 "osaka:릭쿠로 아저씨 치즈케이크": {
  "src": "images/p013.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%83%AA%E3%82%AF%E3%83%AD%E3%83%BC",
  "title": "リクロー"
 },
 "osaka:키노피오 카페 (USJ)": {
  "src": "images/p014.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%83%8F%E3%83%B3%E3%83%90%E3%83%BC%E3%82%B0",
  "title": "ハンバーグ"
 },
 "osaka:버터비어 (해리포터 구역)": {
  "src": "images/p015.jpg",
  "page": "https://en.wikipedia.org/wiki/Universal_City_Station",
  "title": "Universal City Station"
 },
 "osaka:오사카 타코야키 뮤지엄": {
  "src": "images/p016.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%83%A6%E3%83%8B%E3%83%90%E3%83%BC%E3%82%B5%E3%83%AB%E3%83%BB%E3%82%B7%E3%83%86%E3%82%A3%E3%82%A6%E3%82%A9%E3%83%BC%E3%82%AF%E5%A4%A7%E9%98%AA",
  "title": "ユニバーサル・シティウォーク大阪"
 },
 "osaka:나니와 쿠이신보 요코초": {
  "src": "images/p017.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E5%A4%A9%E4%BF%9D%E5%B1%B1%E3%83%8F%E3%83%BC%E3%83%90%E3%83%BC%E3%83%93%E3%83%AC%E3%83%83%E3%82%B8",
  "title": "天保山ハーバービレッジ"
 },
 "osaka:오코노미야키 키지 (다키미코지)": {
  "src": "images/p018.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E7%84%BC%E3%81%8D%E3%81%9D%E3%81%B0",
  "title": "焼きそば"
 },
 "osaka:쿠시카츠 다루마 신세카이 총본점": {
  "src": "images/p019.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E4%B8%B2%E3%82%AB%E3%83%84",
  "title": "串カツ"
 },
 "osaka:쿠시카츠 야에카츠": {
  "src": "images/p020.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%82%B8%E3%83%A3%E3%83%B3%E3%82%B8%E3%83%A3%E3%83%B3%E6%A8%AA%E4%B8%81",
  "title": "ジャンジャン横丁"
 },
 "spot:osaka:airport": {
  "src": "images/p021.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E9%96%A2%E8%A5%BF%E5%9B%BD%E9%9A%9B%E7%A9%BA%E6%B8%AF",
  "title": "関西国際空港"
 },
 "spot:osaka:base": {
  "src": "images/p022.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E9%9B%A3%E6%B3%A2%E9%A7%85_(%E5%8D%97%E6%B5%B7)",
  "title": "難波駅 (南海)"
 },
 "nagoya:오스 상점가": {
  "src": "images/p023.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E5%A4%A7%E9%A0%88_(%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%B8%82)",
  "title": "大須 (名古屋市)"
 },
 "nagoya:나고야 파르코 · 포켓몬센터": {
  "src": "images/p024.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%83%91%E3%83%AB%E3%82%B3",
  "title": "パルコ"
 },
 "nagoya:사카에 · 오아시스21": {
  "src": "images/p025.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%82%AA%E3%82%A2%E3%82%B7%E3%82%B921",
  "title": "オアシス21"
 },
 "nagoya:해리포터 마호도코로": {
  "src": "images/p026.jpg",
  "page": "https://en.wikipedia.org/wiki/Oasis_21",
  "title": "Oasis 21"
 },
 "nagoya:도토리공화국 (지브리스토어)": {
  "src": "images/p027.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%82%B9%E3%82%BF%E3%82%B8%E3%82%AA%E3%82%B8%E3%83%96%E3%83%AA",
  "title": "スタジオジブリ"
 },
 "nagoya:시라카와고": {
  "src": "images/p028.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E7%99%BD%E5%B7%9D%E9%83%B7",
  "title": "白川郷"
 },
 "nagoya:다카야마 옛 거리": {
  "src": "images/p029.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E9%AB%98%E5%B1%B1%E9%99%A3%E5%B1%8B",
  "title": "高山陣屋"
 },
 "nagoya:지브리 파크": {
  "src": "images/p030.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%82%B5%E3%83%84%E3%82%AD%E3%81%A8%E3%83%A1%E3%82%A4%E3%81%AE%E5%AE%B6",
  "title": "サツキとメイの家"
 },
 "nagoya:아츠타 신궁": {
  "src": "images/p031.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E7%86%B1%E7%94%B0%E7%A5%9E%E5%AE%AE",
  "title": "熱田神宮"
 },
 "nagoya:시라토리 정원": {
  "src": "images/p032.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E7%99%BD%E9%B3%A5%E5%BA%AD%E5%9C%92",
  "title": "白鳥庭園"
 },
 "nagoya:돈키호테 사카에 본점": {
  "src": "images/p033.jpg",
  "page": "https://en.wikipedia.org/wiki/Don_Quijote_(store)",
  "title": "Don Quijote (store)"
 },
 "nagoya:나고야성": {
  "src": "images/p034.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%9F%8E",
  "title": "名古屋城"
 },
 "nagoya:미소카츠 야바톤 본점": {
  "src": "images/p035.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E7%9F%A2%E5%A0%B4%E3%81%A8%E3%82%93",
  "title": "矢場とん"
 },
 "nagoya:리상 대만 가라아게": {
  "src": "images/p036.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%81%8B%E3%82%89%E6%8F%9A%E3%81%92",
  "title": "から揚げ"
 },
 "nagoya:테바사키 세카이노 야만짱": {
  "src": "images/p037.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E5%90%8D%E5%8F%A4%E5%B1%8B%E3%82%81%E3%81%97",
  "title": "名古屋めし"
 },
 "nagoya:시라카와고 푸딩의 집": {
  "src": "images/p038.jpg",
  "page": "https://en.wikipedia.org/wiki/Cr%C3%A8me_caramel",
  "title": "Crème caramel"
 },
 "nagoya:고헤이모치 (시라오기)": {
  "src": "images/p039.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E4%BA%94%E5%B9%B3%E9%A4%85",
  "title": "五平餅"
 },
 "nagoya:미야마 두부 카페": {
  "src": "images/p040.jpg",
  "page": "https://en.wikipedia.org/wiki/Tofu",
  "title": "Tofu"
 },
 "nagoya:히다규 초밥 코테우시": {
  "src": "images/p041.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E9%A3%9B%E9%A8%A8%E7%89%9B",
  "title": "飛騨牛"
 },
 "nagoya:미타라시 당고": {
  "src": "images/p042.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%81%BF%E3%81%9F%E3%82%89%E3%81%97%E5%9B%A3%E5%AD%90",
  "title": "みたらし団子"
 },
 "nagoya:다카야마 라멘": {
  "src": "images/p043.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E9%AB%98%E5%B1%B1%E3%83%A9%E3%83%BC%E3%83%A1%E3%83%B3",
  "title": "高山ラーメン"
 },
 "nagoya:대창고 카페 '대륙횡단비행'": {
  "src": "images/p044.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%82%B5%E3%83%B3%E3%83%89%E3%82%A4%E3%83%83%E3%83%81",
  "title": "サンドイッチ"
 },
 "nagoya:마녀의 계곡 '하늘을 나는 오븐'": {
  "src": "images/p045.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E6%84%9B%E3%83%BB%E5%9C%B0%E7%90%83%E5%8D%9A%E8%A8%98%E5%BF%B5%E5%85%AC%E5%9C%92",
  "title": "愛・地球博記念公園"
 },
 "nagoya:로톤다 카제가오카": {
  "src": "images/p046.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%81%8A%E3%81%AB%E3%81%8E%E3%82%8A",
  "title": "おにぎり"
 },
 "nagoya:키시멘 스미요시 (나고야역)": {
  "src": "images/p047.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%81%8D%E3%81%97%E3%82%81%E3%82%93",
  "title": "きしめん"
 },
 "nagoya:미야 키시멘 (아츠타 신궁 경내)": {
  "src": "images/p048.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E5%AE%AE%E5%95%86%E4%BA%8B",
  "title": "宮商事"
 },
 "nagoya:아츠타 호라이켄 본점 (히츠마부시)": {
  "src": "images/p049.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E3%81%82%E3%81%A4%E3%81%9F%E8%93%AC%E8%8E%B1%E8%BB%92",
  "title": "あつた蓬莱軒"
 },
 "nagoya:시라토리 정원 찻집": {
  "src": "images/p050.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E6%8A%B9%E8%8C%B6",
  "title": "抹茶"
 },
 "spot:nagoya:airport": {
  "src": "images/p051.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E4%B8%AD%E9%83%A8%E5%9B%BD%E9%9A%9B%E7%A9%BA%E6%B8%AF",
  "title": "中部国際空港"
 },
 "spot:nagoya:base": {
  "src": "images/p052.jpg",
  "page": "https://ja.wikipedia.org/wiki/%E5%90%8D%E5%8F%A4%E5%B1%8B%E9%A7%85",
  "title": "名古屋駅"
 }
};
