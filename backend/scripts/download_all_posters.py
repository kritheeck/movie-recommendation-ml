import os
import time
import urllib.request
from pathlib import Path

OUT_DIR = Path("c:/Users/Kritheeck/Desktop/ml project/movie-rec/frontend/public/posters")
OUT_DIR.mkdir(parents=True, exist_ok=True)

POSTER_SOURCES = {
    109487: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    79132: "https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg",
    2571: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    134130: "https://upload.wikimedia.org/wikipedia/en/c/cd/The_Martian_film_poster.jpg",
    335984: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    329865: "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
    438631: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    693134: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    72998: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
    1270: "https://upload.wikimedia.org/wikipedia/en/d/d2/Back_to_the_Future.jpg",
    589: "https://upload.wikimedia.org/wikipedia/en/5/5e/Terminator_2-Judgment_Day.png",
    480: "https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg",
    920: "https://upload.wikimedia.org/wikipedia/en/e/ef/2001_A_Space_Odyssey_%281968%29_theatrical_poster.jpg",
    157336: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    32: "https://upload.wikimedia.org/wikipedia/en/c/cf/Twelve_monkeys_imp.jpg",
    58559: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    91529: "https://upload.wikimedia.org/wikipedia/en/8/83/Dark_knight_rises_poster.jpg",
    272: "https://upload.wikimedia.org/wikipedia/en/a/af/Batman_Begins_Poster.jpg",
    89745: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
    193565: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    193587: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    112852: "https://upload.wikimedia.org/wikipedia/en/3/33/Guardians_of_the_Galaxy_poster.jpg",
    122904: "https://upload.wikimedia.org/wikipedia/en/2/23/Deadpool_%282016_poster%29.png",
    187593: "https://upload.wikimedia.org/wikipedia/en/c/cf/Deadpool_2_poster.jpg",
    168252: "https://upload.wikimedia.org/wikipedia/en/3/37/Logan_2017_poster.jpg",
    193609: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
    569094: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    361743: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    1198: "https://upload.wikimedia.org/wikipedia/en/4/4c/Raiders_of_the_Lost_Ark.jpg",
    3578: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
    110: "https://upload.wikimedia.org/wikipedia/en/5/55/Braveheart_imp.jpg",
    6: "https://upload.wikimedia.org/wikipedia/en/6/6c/Heatposter.jpg",
    245891: "https://upload.wikimedia.org/wikipedia/en/9/98/John_Wick_TeaserPoster.jpg",
    76341: "https://upload.wikimedia.org/wikipedia/en/6/6e/Mad_Max_Fury_Road.jpg",
    318: "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
    858: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    1221: "https://upload.wikimedia.org/wikipedia/en/4/42/The_Godfather_Part_II.jpg",
    296: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    2959: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    593: "https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg",
    47: "https://upload.wikimedia.org/wikipedia/en/6/68/Seven_%28movie%29_poster.jpg",
    50: "https://upload.wikimedia.org/wikipedia/en/9/9c/Usual_suspects_ver1.jpg",
    527: "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
    356: "https://upload.wikimedia.org/wikipedia/en/6/67/Forrest_Gump_poster.jpg",
    4226: "https://upload.wikimedia.org/wikipedia/en/c/c7/Memento_poster.jpg",
    99114: "https://upload.wikimedia.org/wikipedia/en/8/8b/Django_Unchained_Poster.jpg",
    68157: "https://upload.wikimedia.org/wikipedia/en/c/c3/Inglourious_Basterds_poster.jpg",
    201773: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    496243: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    244786: "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    475557: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    1422: "https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg61T.jpg",
    769: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
    10681: "https://upload.wikimedia.org/wikipedia/en/c/c2/WALL-Eposter.jpg",
    1: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
    129: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    177765: "https://upload.wikimedia.org/wikipedia/en/a/ab/La_La_Land_%28film%29.png",
    1721: "https://upload.wikimedia.org/wikipedia/en/1/18/Titanic_%281997_film%29_poster.png",
    4993: "https://upload.wikimedia.org/wikipedia/en/8/8a/The_Lord_of_the_Rings_The_Fellowship_of_the_Ring_%282001%29.jpg",
    5952: "https://image.tmdb.org/t/p/w500/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg",
    7153: "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
}

headers = {
    "User-Agent": "MovieRecBot/1.0 (academic research platform; contact: info@movierec.local)"
}

fallback_url = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80"
fallback_bytes = None

def get_fallback():
    global fallback_bytes
    if fallback_bytes is None:
        req = urllib.request.Request(fallback_url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as r:
            fallback_bytes = r.read()
    return fallback_bytes

success_count = 0
for mid, url in POSTER_SOURCES.items():
    dest = OUT_DIR / f"{mid}.jpg"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read()
            if len(data) > 500:
                dest.write_bytes(data)
                success_count += 1
                print(f"Saved {mid} ({len(data)} bytes)")
            else:
                dest.write_bytes(get_fallback())
    except Exception as e:
        print(f"Fallback for {mid}: {e}")
        try:
            dest.write_bytes(get_fallback())
            success_count += 1
        except Exception:
            pass
    time.sleep(0.1)


print(f"Finished! Total saved posters: {success_count}/{len(POSTER_SOURCES)}")
