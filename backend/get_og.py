import urllib.request, re

def get_tmdb_og_image(tmdb_id):
    url = f"https://www.themoviedb.org/movie/{tmdb_id}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
            m = re.search(r'property="og:image"\s+content="([^"]+)"', html)
            if m:
                return m.group(1)
    except Exception as e:
        return f"ERR: {e}"

print("134130 (The Martian):", get_tmdb_og_image(134130))
print("272 (Batman Begins):", get_tmdb_og_image(272))
print("112852 (Guardians):", get_tmdb_og_image(112852))
