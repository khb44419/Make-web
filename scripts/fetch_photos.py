"""위키백과 대표 사진을 받아 images/ 에 저장하고 photos.js 를 만든다 (GitHub Actions 에서 실행).

- photos-src.json 의 후보 제목을 앞에서부터 시도한다.
- 같은 도시 안에서 이미 쓴 사진(같은 원본 파일)은 건너뛰어 사진이 겹치지 않게 한다.
- 로고 같은 SVG 는 건너뛴다.
"""
import json, os, re, sys, urllib.parse, urllib.request

UA = {"User-Agent": "MaehwaTripPlanner/1.0 (https://github.com/khb44419/Make-web)"}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    return data if binary else json.loads(data)


def commons_search(query, skip):
    """search:키워드 → 위키미디어 공용(Commons)에서 사진 파일을 검색해 차례로 돌려준다."""
    url = ("https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6"
           f"&gsrlimit=15&gsrsearch={urllib.parse.quote('filetype:bitmap ' + query)}"
           "&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=960")
    try:
        pages = get(url).get("query", {}).get("pages", {})
    except Exception as e:
        print(f"  - search:{query}: 실패 ({e})")
        return []
    out = []
    for p in sorted(pages.values(), key=lambda p: p.get("index", 0)):
        ii = (p.get("imageinfo") or [{}])[0]
        if ii.get("mime") != "image/jpeg" or ii.get("width", 0) < 800 or ii.get("width", 0) < ii.get("height", 1):
            continue  # 가로 사진(JPEG)만
        out.append({"orig": ii["url"], "width": ii["width"], "thumb": ii.get("thumburl", ii["url"]),
                    "page": ii.get("descriptionurl", ""), "title": p["title"].replace("File:", "")})
    return out


def summary(cand):
    lang, title = ("en", cand[3:]) if cand.startswith("en:") else ("ja", cand)
    url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title.replace(' ', '_'), safe='')}"
    try:
        j = get(url)
    except Exception as e:
        print(f"  - {cand}: 실패 ({e})")
        return None
    o, t = j.get("originalimage"), j.get("thumbnail")
    if not o or not t:
        print(f"  - {cand}: 대표 사진 없음")
        return None
    name = o["source"].rsplit("/", 1)[-1]
    # 로고 · 워드마크 · '사진 없음' 그림은 건너뛴다 (로고는 보통 SVG/PNG)
    if name.lower().endswith((".svg", ".png", ".gif")) or re.search(r"logo|wordmark|no_?image|placeholder|symbol", name, re.I):
        print(f"  - {cand}: 로고/아이콘 같은 그림이라 건너뜀 ({name})")
        return None
    return {"orig": o["source"], "width": o.get("width", 0), "thumb": t["source"],
            "page": j.get("content_urls", {}).get("mobile", {}).get("page", ""), "title": j.get("title", title)}


def ahash(im):
    small = im.convert("L").resize((8, 8))
    px = list(small.getdata())
    avg = sum(px) / len(px)
    return sum(1 << i for i, v in enumerate(px) if v > avg)


def similar(h, hashes):
    return any(bin(h ^ o).count("1") <= 8 for o in hashes)


def download(info, dest_base, hashes):
    # 위키미디어 표준 썸네일 크기(960 → 500 → 기본 썸네일 → 원본) 순서로 시도
    urls = []
    if "/thumb/" in info["thumb"]:
        for w in (960, 500):
            if info["width"] > w:
                urls.append(re.sub(r"/\d+px-", f"/{w}px-", info["thumb"]))
    urls += [info["thumb"]]
    if info["width"] <= 1600:
        urls.append(info["orig"])
    for u in urls:
        try:
            data = get(u, binary=True)
        except Exception as e:
            print(f"    · {u[-60:]}: {e}")
            continue
        path = dest_base + ".jpg"
        try:
            from PIL import Image
            import io
            im = Image.open(io.BytesIO(data)).convert("RGB")
            h = ahash(im)
            if similar(h, hashes):
                print("    · 이미 쓴 사진과 거의 같아서 건너뜀")
                return None
            hashes.append(h)
            if im.width > 900:
                im = im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS)
            im.save(os.path.join(ROOT, path), "JPEG", quality=80, optimize=True, progressive=True)
        except Exception as e:
            print(f"    · 이미지 변환 실패: {e}")
            continue
        return path
    return None


def main():
    src = json.load(open(os.path.join(ROOT, "photos-src.json"), encoding="utf8"))
    os.makedirs(os.path.join(ROOT, "images"), exist_ok=True)
    for f in os.listdir(os.path.join(ROOT, "images")):
        os.remove(os.path.join(ROOT, "images", f))
    used, out, n = {}, {}, 0
    for key, cands in src.items():
        if key.startswith("_"):
            continue
        # 도시별로 겹침을 막는다 (표지 사진도 그 도시 그룹에 포함)
        group = key.replace("spot:", "").replace("cover:", "").replace("hero:", "").split(":")[0]
        seen = used.setdefault(group, set())
        hashes = used.setdefault(group + ":hash", [])
        print(key)
        infos = []
        for cand in cands:
            if cand.startswith("search:"):
                infos += [(cand, i) for i in commons_search(cand[7:], seen)]
            else:
                infos.append((cand, None))
        for cand, info in infos:
            info = info or summary(cand)
            if not info:
                continue
            file_id = info["orig"].rsplit("/", 1)[-1]
            if file_id in seen:
                print(f"  - {cand}: 이미 쓴 사진이라 건너뜀")
                continue
            n += 1
            path = download(info, f"images/p{n:03d}", hashes)
            if not path:
                continue
            seen.add(file_id)
            out[key] = {"src": path, "page": info["page"], "title": info["title"]}
            print(f"  ✓ {cand} → {path}")
            break
        else:
            print("  ✗ 사진 없음 (글자 표시)")
    with open(os.path.join(ROOT, "photos.js"), "w", encoding="utf8") as f:
        f.write("// scripts/fetch_photos.py 가 자동으로 만든 파일 (직접 고치지 마세요)\n")
        f.write("const PHOTOS = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
    print(f"완료: {len(out)}/{len([k for k in src if not k.startswith('_')])}")


if __name__ == "__main__":
    sys.exit(main())
