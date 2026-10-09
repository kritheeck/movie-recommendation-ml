"""Movie service for querying catalog, genres, posters, and pagination."""

from __future__ import annotations

import logging
import pandas as pd

from app.core.config import get_settings
from app.schemas.movie import Movie, MovieListResponse
from ml.data.loader import DatasetLoader

logger = logging.getLogger("app.services.movie")

# Comprehensive Curated High-Res TMDB Posters
CURATED_POSTERS: dict[int, str] = {
    # Sci-Fi / Mind-Bending
    109487: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",  # Interstellar
    79132: "https://image.tmdb.org/t/p/w500/8IB2e4r4oVhHn97L9flY20xYZa0.jpg",   # Inception
    2571: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",    # The Matrix
    134130: "https://image.tmdb.org/t/p/w500/5BHuvQ6p9k2msP1DY2agax89zM7.jpg",  # The Martian
    335984: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",  # Blade Runner 2049
    329865: "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",  # Arrival
    438631: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",  # Dune
    693134: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",  # Dune 2
    72998: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",   # Avatar
    1270: "https://image.tmdb.org/t/p/w500/fNOH9f1aA7XRTzl1sBABqZioA3C.jpg",    # Back to the Future
    589: "https://image.tmdb.org/t/p/w500/5M0j0B18abtBIU9um9RgqOSEN32.jpg",     # Terminator 2
    480: "https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg",     # Jurassic Park
    920: "https://image.tmdb.org/t/p/w500/ve72VxNqjGM69UmK18Y95lPqE2e.jpg",     # 2001 Space Odyssey
    157336: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",  # Gravity
    32: "https://image.tmdb.org/t/p/w500/6WBeq4fCfn7AN0o21W9q02RF27B.jpg",      # Twelve Monkeys
    260: "https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",     # Star Wars IV
    1196: "https://image.tmdb.org/t/p/w500/nNAeTmF4CtdSgMDplXTD9pG2Fft.jpg",    # Empire Strikes Back
    1210: "https://image.tmdb.org/t/p/w500/jx5p0aHlbPXqe3AH9G15NvmWaqQ.jpg",   # Return of the Jedi

    # Action / Superhero / Blockbuster
    58559: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",   # The Dark Knight
    91529: "https://image.tmdb.org/t/p/w500/hrJUZB8gA8nE594b2Wk391a3k1.jpg",   # Dark Knight Rises
    272: "https://image.tmdb.org/t/p/w500/4MpN4CnjBmhk2ALsrR1f9Q2R9K8.jpg",     # Batman Begins
    89745: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",   # The Avengers
    193565: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",  # Infinity War
    193587: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",  # Endgame
    112852: "https://image.tmdb.org/t/p/w500/y31QB9kn3XNxFfl19NJAcb2lhq.jpg",  # Guardians of Galaxy
    122904: "https://image.tmdb.org/t/p/w500/fSRb7vyIP8rQpL0I47P3q8X1V1.jpg",  # Deadpool 1
    187593: "https://image.tmdb.org/t/p/w500/to0spRl1CMDvyUbvdvNbsQ308nr.jpg",  # Deadpool 2
    168252: "https://image.tmdb.org/t/p/w500/fnbjcRDXdopnPoBf4W6930jk1j.jpg",  # Logan
    193609: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",  # Spider-Verse
    569094: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",  # Across the Spider-Verse
    361743: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",  # Top Gun Maverick
    1198: "https://image.tmdb.org/t/p/w500/ceG9VzoRAVGwivFU403Wc39gq9.jpg",    # Raiders of Lost Ark
    3578: "https://image.tmdb.org/t/p/w500/ehG9jQ5w18bU7L9uN0wQ2d4qe.jpg",   # Gladiator
    110: "https://image.tmdb.org/t/p/w500/or1gBugydmjToAEqF9wD5t7e1gL.jpg",     # Braveheart
    6: "https://image.tmdb.org/t/p/w500/umXNmfd476h8c3G1F8X7u6b3kFm.jpg",       # Heat
    245891: "https://image.tmdb.org/t/p/w500/fZPSMVcKrrZqJwP2gu0qiUwUQv9.jpg",  # John Wick
    76341: "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg",   # Mad Max Fury Road
    10: "https://image.tmdb.org/t/p/w500/5c04PfgeTy57zW1X325eX3Wn1pU.jpg",      # GoldenEye

    # Drama / Crime / Noir / Masterpieces
    318: "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",     # Shawshank Redemption
    858: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",     # The Godfather
    1221: "https://image.tmdb.org/t/p/w500/hek3koDUyMrk7u6zqgwhq4pL7p5.jpg",    # Godfather II
    296: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",     # Pulp Fiction
    2959: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",    # Fight Club
    593: "https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg",     # Silence of the Lambs
    47: "https://image.tmdb.org/t/p/w500/69Sns8WoET6C6FL8hBhYxhPzJqP.jpg",      # Se7en
    50: "https://image.tmdb.org/t/p/w500/bUPmQvN4q0fg7Yw9749Vn0R8Q1H.jpg",      # The Usual Suspects
    527: "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",     # Schindler's List
    356: "https://image.tmdb.org/t/p/w500/arw2VCBveWOVZr6pxd9XTd1TdQa.jpg",     # Forrest Gump
    4226: "https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cBTCAk9z9442Al.jpg",    # Memento
    99114: "https://image.tmdb.org/t/p/w500/7oWY8vd27z5k6gT69csmhX8rW0.jpg",   # Django Unchained
    68157: "https://image.tmdb.org/t/p/w500/7sfbEnaARXDDhKm0CZ7D7ky2U01.jpg",   # Inglourious Basterds
    201773: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",  # Oppenheimer
    496243: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",  # Parasite
    244786: "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",  # Whiplash
    475557: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",  # Joker
    1422: "https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg61T.jpg",    # The Departed
    769: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",     # Goodfellas
    10681: "https://image.tmdb.org/t/p/w500/hUQ15daVz5d1qZzL2eK5k8B4y24.jpg",  # WALL-E
    1: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",       # Toy Story
    2: "https://image.tmdb.org/t/p/w500/vgpXmVaVyVZvuKFBGq1YJMGkeq5.jpg",       # Jumanji
    129: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",     # Spirited Away
    177765: "https://image.tmdb.org/t/p/w500/ylXCdC106IKiarftHkcacasaAcb.jpg",  # La La Land
    1721: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",    # Titanic
    2028: "https://image.tmdb.org/t/p/w500/uqx37cS8cpHg8U35f9U5IBlrCV3.jpg",    # Saving Private Ryan
    2762: "https://image.tmdb.org/t/p/w500/4AfSDjjCy6T5LA1BCz6bg9wmUVl.jpg",    # Sixth Sense
    2858: "https://image.tmdb.org/t/p/w500/wby9315QzVKx9APmFe8NJJq2Tg3.jpg",    # American Beauty
    4993: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cDK6.jpg",    # LOTR Fellowship
    5952: "https://image.tmdb.org/t/p/w500/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg",    # LOTR Two Towers
    7153: "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",    # LOTR Return of King
    116797: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",  # Grand Budapest Hotel
}

# Curated High-Definition TMDB Backdrops
CURATED_BACKDROPS: dict[int, str] = {
    109487: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",  # Interstellar
    79132: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",   # Inception
    2571: "https://image.tmdb.org/t/p/original/fNG7i7rqMErkcqhoVVaj1xR5y9Z.jpg",    # The Matrix
    134130: "https://image.tmdb.org/t/p/original/vI3aWG1h0b92WwZ2u6H3m0r3K6I.jpg",  # The Martian
    335984: "https://image.tmdb.org/t/p/original/sAtoMqDVhNDQBc3QJL3RF6hlxGq.jpg",  # Blade Runner 2049
    329865: "https://image.tmdb.org/t/p/original/yIZ1xendyqKvY3FGeeUYUd5X9Mm.jpg",  # Arrival
    438631: "https://image.tmdb.org/t/p/original/lzWHmYZrBTAmPT9vcYIS0sd552C.jpg",  # Dune
    693134: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520b22.jpg",  # Dune 2
    72998: "https://image.tmdb.org/t/p/original/vL5LR6WdxWPjC3z4I166Q1eR4u9.jpg",   # Avatar
    58559: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",   # The Dark Knight
    91529: "https://image.tmdb.org/t/p/original/cEAXd0yK8o2Q4y2n9h7W5m4o3P4.jpg",   # Dark Knight Rises
    193565: "https://image.tmdb.org/t/p/original/bOGkgRGdhrBYJSLpXaxhXVstNsV.jpg",  # Infinity War
    193587: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",  # Endgame
    193609: "https://image.tmdb.org/t/p/original/uUiId6oipp3x4Dsv7aq3cqqgL4e.jpg",  # Spider-Verse
    569094: "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",  # Across the Spider-Verse
    361743: "https://image.tmdb.org/t/p/original/AaV1YIdWKnjAIAOe8UUKBFm327v.jpg",  # Top Gun Maverick
    318: "https://image.tmdb.org/t/p/original/kXfqFcZT425y90hS57k9383e9n8.jpg",     # Shawshank
    858: "https://image.tmdb.org/t/p/original/tmU7GeKVybMWF92Q2GRGTuPtJv3.jpg",     # Godfather
    296: "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",     # Pulp Fiction
    2959: "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",    # Fight Club
    201773: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",  # Oppenheimer
    496243: "https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg",  # Parasite
    177765: "https://image.tmdb.org/t/p/original/nadTUTBgDi09vq4mFl4smL26NgW.jpg",  # La La Land
    4993: "https://image.tmdb.org/t/p/original/vRQnzOn4H106y3gxKLrAyGRN8a1.jpg",    # LOTR Fellowship
    5952: "https://image.tmdb.org/t/p/original/kWYfW2Re0rUDE6IHhyHmSdcuVGB.jpg",    # LOTR Two Towers
    7153: "https://image.tmdb.org/t/p/original/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg",    # LOTR Return of King
}

GENRE_BACKDROPS: dict[str, str] = {
    "action": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    "adventure": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    "animation": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    "comedy": "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&auto=format&fit=crop&q=80",
    "crime": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80",
    "drama": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80",
    "fantasy": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    "horror": "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&auto=format&fit=crop&q=80",
    "mystery": "https://images.unsplash.com/photo-1519074069444-1ba4ea16e897?w=800&auto=format&fit=crop&q=80",
    "romance": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&auto=format&fit=crop&q=80",
    "sci-fi": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    "thriller": "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80",
    "war": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
    "western": "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80",
}


def _generate_poster_url(movie_id: int, genres: list[str]) -> str:
    """Returns local static poster URL served directly by Next.js frontend."""
    return f"/posters/{movie_id}.jpg"



def _generate_backdrop_url(movie_id: int, genres: list[str]) -> str:
    """Returns curated TMDB backdrop URL or genre-themed backdrop."""
    if movie_id in CURATED_BACKDROPS:
        return CURATED_BACKDROPS[movie_id]

    for g in genres:
        g_lower = g.lower().strip()
        if g_lower in GENRE_BACKDROPS:
            return GENRE_BACKDROPS[g_lower]

    return "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80"


class MovieService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._movies_df: pd.DataFrame | None = None
        self._ratings_df: pd.DataFrame | None = None
        self._movie_stats: dict[int, tuple[float, int]] = {}

    def _ensure_loaded(self) -> None:
        if self._movies_df is None:
            loader = DatasetLoader(self.settings.data_dir)
            self._movies_df = loader.load_movies()
            try:
                self._ratings_df = loader.load_ratings()
                stats = self._ratings_df.groupby("movieId")["rating"].agg(["mean", "count"])
                self._movie_stats = {
                    int(mid): (round(float(row["mean"]), 2), int(row["count"]))
                    for mid, row in stats.iterrows()
                }
            except Exception:
                self._movie_stats = {}

    def get_movie_df(self) -> pd.DataFrame:
        self._ensure_loaded()
        assert self._movies_df is not None
        return self._movies_df

    def get_movies(
        self,
        query: str | None = None,
        genre: str | None = None,
        year: int | None = None,
        page: int = 1,
        page_size: int = 24,
    ) -> MovieListResponse:
        self._ensure_loaded()
        assert self._movies_df is not None
        df = self._movies_df

        if query:
            q_clean = query.strip().lower()
            df = df[df["title"].str.lower().str.contains(q_clean, na=False)]

        if genre and genre.lower() != "all":
            df = df[df["genres"].str.lower().str.contains(genre.lower(), na=False)]

        if year:
            df = df[df["year"] == year]

        total = len(df)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        subset = df.iloc[start_idx:end_idx]

        items: list[Movie] = []
        for _, row in subset.iterrows():
            mid = int(row["movieId"])
            avg_r, cnt = self._movie_stats.get(mid, (3.5, 0))
            genre_list = row["genre_list"]
            title = str(row["title"])
            poster = _generate_poster_url(mid, genre_list)
            backdrop = _generate_backdrop_url(mid, genre_list)
            items.append(
                Movie(
                    id=mid,
                    title=title,
                    genres=genre_list,
                    year=int(row["year"]) if pd.notnull(row["year"]) else None,
                    poster_url=poster,
                    backdrop_url=backdrop,
                    avg_rating=avg_r,
                    rating_count=cnt,
                )
            )

        return MovieListResponse(items=items, total=total, page=page, page_size=page_size)

    def get_movie_by_id(self, movie_id: int) -> Movie | None:
        self._ensure_loaded()
        assert self._movies_df is not None
        row = self._movies_df[self._movies_df["movieId"] == movie_id]
        if row.empty:
            return None
        r = row.iloc[0]
        avg_r, cnt = self._movie_stats.get(movie_id, (3.5, 0))
        genre_list = r["genre_list"]
        title = str(r["title"])
        poster = _generate_poster_url(movie_id, genre_list)
        backdrop = _generate_backdrop_url(movie_id, genre_list)
        return Movie(
            id=movie_id,
            title=title,
            genres=genre_list,
            year=int(r["year"]) if pd.notnull(r["year"]) else None,
            poster_url=poster,
            backdrop_url=backdrop,
            avg_rating=avg_r,
            rating_count=cnt,
        )


movie_service = MovieService()
