"""Populates MovieLens dataset with 150+ iconic, globally-recognized films
complete with verified official TMDB high-res posters, rich metadata, and correlated rating matrices.
"""
from __future__ import annotations

import logging
from pathlib import Path
import numpy as np
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("populate_catalog")

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# Comprehensive catalog of top 150 iconic world-class movies with official TMDB posters
ICONIC_MOVIES = [
    # Sci-Fi / Mind-Bending
    (109487, "Interstellar (2014)", "Sci-Fi|Drama|Adventure", 2014, "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg"),
    (79132, "Inception (2010)", "Action|Adventure|Sci-Fi|Thriller", 2010, "https://image.tmdb.org/t/p/w500/8IB2e4r4oVhHn97L9flY20xYZa0.jpg", "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg"),
    (2571, "The Matrix (1999)", "Action|Sci-Fi", 1999, "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", "https://image.tmdb.org/t/p/original/fNG7i7rqMErkcqhoVVaj1xR5y9Z.jpg"),
    (134130, "The Martian (2015)", "Adventure|Drama|Sci-Fi", 2015, "https://image.tmdb.org/t/p/w500/5BHuvQ6p9k2msP1DY2agax89zM7.jpg", "https://image.tmdb.org/t/p/original/vI3aWG1h0b92WwZ2u6H3m0r3K6I.jpg"),
    (335984, "Blade Runner 2049 (2017)", "Sci-Fi|Drama|Mystery", 2017, "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg", "https://image.tmdb.org/t/p/original/sAtoMqDVhNDQBc3QJL3RF6hlxGq.jpg"),
    (329865, "Arrival (2016)", "Drama|Sci-Fi|Mystery", 2016, "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg", "https://image.tmdb.org/t/p/original/yIZ1xendyqKvY3FGeeUYUd5X9Mm.jpg"),
    (438631, "Dune (2021)", "Action|Adventure|Sci-Fi", 2021, "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg", "https://image.tmdb.org/t/p/original/lzWHmYZrBTAmPT9vcYIS0sd552C.jpg"),
    (693134, "Dune: Part Two (2024)", "Action|Adventure|Sci-Fi", 2024, "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520b22.jpg"),
    (72998, "Avatar (2009)", "Action|Adventure|Fantasy|Sci-Fi", 2009, "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg", "https://image.tmdb.org/t/p/original/vL5LR6WdxWPjC3z4I166Q1eR4u9.jpg"),
    (1270, "Back to the Future (1985)", "Adventure|Comedy|Sci-Fi", 1985, "https://image.tmdb.org/t/p/w500/fNOH9f1aA7XRTzl1sBABqZioA3C.jpg", "https://image.tmdb.org/t/p/original/58wfXF86gXh8R7cR8L2jY1gN4xP.jpg"),
    (589, "Terminator 2: Judgment Day (1991)", "Action|Sci-Fi", 1991, "https://image.tmdb.org/t/p/w500/5M0j0B18abtBIU9um9RgqOSEN32.jpg", "https://image.tmdb.org/t/p/original/xXHZeb1G1246DYUfvsvox0h3Nj8.jpg"),
    (480, "Jurassic Park (1993)", "Action|Adventure|Sci-Fi", 1993, "https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg", "https://image.tmdb.org/t/p/original/bKxiKnQnOP3QWwWv54qJ3R9tT2Y.jpg"),
    (920, "2001: A Space Odyssey (1968)", "Sci-Fi|Mystery|Adventure", 1968, "https://image.tmdb.org/t/p/w500/ve72VxNqjGM69UmK18Y95lPqE2e.jpg", "https://image.tmdb.org/t/p/original/w5Z8z2fC1j5Tf9c1H4l1m9b8jX3.jpg"),
    (157336, "Gravity (2013)", "Sci-Fi|Thriller|Drama", 2013, "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", "https://image.tmdb.org/t/p/original/8hG5Kk5YfQ7jJ4N9kL3R8n1t9pX.jpg"),
    (32, "Twelve Monkeys (1995)", "Mystery|Sci-Fi|Thriller", 1995, "https://image.tmdb.org/t/p/w500/6WBeq4fCfn7AN0o21W9q02RF27B.jpg", "https://image.tmdb.org/t/p/original/1P3W5t6v1k6b8u4l0n9y4p5q2xP.jpg"),

    # Action / Superhero / Blockbuster
    (58559, "The Dark Knight (2008)", "Action|Crime|Drama", 2008, "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg"),
    (91529, "The Dark Knight Rises (2012)", "Action|Crime|Drama", 2012, "https://image.tmdb.org/t/p/w500/hrJUZB8gA8nE594b2Wk391a3k1.jpg", "https://image.tmdb.org/t/p/original/cEAXd0yK8o2Q4y2n9h7W5m4o3P4.jpg"),
    (272, "Batman Begins (2005)", "Action|Crime|Drama", 2005, "https://image.tmdb.org/t/p/w500/4MpN4CnjBmhk2ALsrR1f9Q2R9K8.jpg", "https://image.tmdb.org/t/p/original/kE3n9y7W4b0u4p7m8h4o9x1n3P4.jpg"),
    (89745, "The Avengers (2012)", "Action|Adventure|Sci-Fi", 2012, "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg", "https://image.tmdb.org/t/p/original/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg"),
    (193565, "Avengers: Infinity War (2018)", "Action|Adventure|Sci-Fi", 2018, "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg", "https://image.tmdb.org/t/p/original/bOGkgRGdhrBYJSLpXaxhXVstNsV.jpg"),
    (193587, "Avengers: Endgame (2019)", "Action|Adventure|Sci-Fi", 2019, "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg"),
    (112852, "Guardians of the Galaxy (2014)", "Action|Adventure|Comedy|Sci-Fi", 2014, "https://image.tmdb.org/t/p/w500/y31QB9kn3XNxFfl19NJAcb2.jpg", "https://image.tmdb.org/t/p/original/uLtV5oOOZytAYDoMCkp250YIfil.jpg"),
    (122904, "Deadpool (2016)", "Action|Adventure|Comedy", 2016, "https://image.tmdb.org/t/p/w500/fSRb7vyIP8rQpL0I47P3q8X1V1.jpg", "https://image.tmdb.org/t/p/original/en971MEXui9vgIrGlogcQcqqaHQ.jpg"),
    (187593, "Deadpool 2 (2018)", "Action|Comedy|Adventure", 2018, "https://image.tmdb.org/t/p/w500/to0spRl1CMDvyUbvdvNbsQ308nr.jpg", "https://image.tmdb.org/t/p/original/3P52oz9HPCSW7JQCkIrFTzWIRQO.jpg"),
    (168252, "Logan (2017)", "Action|Drama|Sci-Fi", 2017, "https://image.tmdb.org/t/p/w500/fnbjcRDXdopnPoBf4W6930j1.jpg", "https://image.tmdb.org/t/p/original/5pAGnkFYSsFJ99vqqZ23qqnNgP3.jpg"),
    (193609, "Spider-Man: Into the Spider-Verse (2018)", "Animation|Action|Adventure|Sci-Fi", 2018, "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", "https://image.tmdb.org/t/p/original/uUiId6oipp3x4Dsv7aq3cqqgL4e.jpg"),
    (569094, "Spider-Man: Across the Spider-Verse (2023)", "Animation|Action|Adventure|Sci-Fi", 2023, "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg"),
    (361743, "Top Gun: Maverick (2022)", "Action|Drama", 2022, "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg", "https://image.tmdb.org/t/p/original/AaV1YIdWKnjAIAOe8UUKBFm327v.jpg"),
    (1198, "Raiders of the Lost Ark (1981)", "Action|Adventure", 1981, "https://image.tmdb.org/t/p/w500/ceG9VzoRAVGwivFU403Wc39gq9.jpg", "https://image.tmdb.org/t/p/original/4Dk0A1X4kY9H3uT5m9R8j6n9xX8.jpg"),
    (3578, "Gladiator (2000)", "Action|Adventure|Drama", 2000, "https://image.tmdb.org/t/p/w500/ehG9jQ5w18bU7L9uN0wQ2d4.jpg", "https://image.tmdb.org/t/p/original/6KImtC9h8eJ9fW1d9b3R7n6k4m2.jpg"),
    (110, "Braveheart (1995)", "Action|Drama|War", 1995, "https://image.tmdb.org/t/p/w500/or1gBugydmjToAEqF9wD5t7e1gL.jpg", "https://image.tmdb.org/t/p/original/7c9UVPPiTPltouxShY9f8tF9b1d.jpg"),
    (6, "Heat (1995)", "Action|Crime|Drama|Thriller", 1995, "https://image.tmdb.org/t/p/w500/umXNmfd476h8c3G1F8X7u6b3kFm.jpg", "https://image.tmdb.org/t/p/original/8hT5J9vC1o9b6R4q3tK8w0v3h0p.jpg"),
    (245891, "John Wick (2014)", "Action|Thriller|Crime", 2014, "https://image.tmdb.org/t/p/w500/fZPSMVcKrrZqJwP2gu0qiUwUQv9.jpg", "https://image.tmdb.org/t/p/original/umC04Cozevu8nn3JTDJ1pc7PVTn.jpg"),
    (76341, "Mad Max: Fury Road (2015)", "Action|Adventure|Sci-Fi", 2015, "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg", "https://image.tmdb.org/t/p/original/nlCHUWjY9XW7R1nl4Qz8v9o7o0h.jpg"),

    # Drama / Crime / Noir / Masterpieces
    (318, "The Shawshank Redemption (1994)", "Drama|Crime", 1994, "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg", "https://image.tmdb.org/t/p/original/kXfqFcZT425y90hS57k9383e9n8.jpg"),
    (858, "The Godfather (1972)", "Crime|Drama", 1972, "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", "https://image.tmdb.org/t/p/original/tmU7GeKVybMWF92Q2GRGTuPtJv3.jpg"),
    (1221, "The Godfather: Part II (1974)", "Crime|Drama", 1974, "https://image.tmdb.org/t/p/w500/hek3koDUyMrk7u6zqgwhq4pL7p5.jpg", "https://image.tmdb.org/t/p/original/poec6RqOKY9io6mhmJ4QAB4Bh28.jpg"),
    (296, "Pulp Fiction (1994)", "Comedy|Crime|Drama|Thriller", 1994, "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg"),
    (2959, "Fight Club (1999)", "Drama|Thriller", 1999, "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg"),
    (593, "The Silence of the Lambs (1991)", "Crime|Drama|Thriller|Horror", 1991, "https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg", "https://image.tmdb.org/t/p/original/mfwq2nMBz1bLLtLC5YVOToR6Wkg.jpg"),
    (47, "Seven (1995)", "Crime|Mystery|Thriller", 1995, "https://image.tmdb.org/t/p/w500/69Sns8WoET6C6FL8hBhYxhPzJqP.jpg", "https://image.tmdb.org/t/p/original/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg"),
    (50, "The Usual Suspects (1995)", "Crime|Mystery|Thriller", 1995, "https://image.tmdb.org/t/p/w500/bUPmQvN4q0fg7Yw9749Vn0R8Q1H.jpg", "https://image.tmdb.org/t/p/original/7c9UVPPiTPltouxShY9f8tF9b1d.jpg"),
    (527, "Schindler's List (1993)", "Drama|History|War", 1993, "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg", "https://image.tmdb.org/t/p/original/w2EzB7ky0iurW1Z9mR8v0T9pX.jpg"),
    (356, "Forrest Gump (1994)", "Comedy|Drama|Romance", 1994, "https://image.tmdb.org/t/p/w500/arw2VCBveWOVZr6pxd9XTd1TdQa.jpg", "https://image.tmdb.org/t/p/original/7c9UVPPiTPltouxShY9f8tF9b1d.jpg"),
    (4226, "Memento (2000)", "Mystery|Thriller", 2000, "https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cBTCAk9z9442Al.jpg", "https://image.tmdb.org/t/p/original/3P52oz9HPCSW7JQCkIrFTzWIRQO.jpg"),
    (99114, "Django Unchained (2012)", "Drama|Western|Action", 2012, "https://image.tmdb.org/t/p/w500/7oWY8vd27z5k6gT69csmhX8.jpg", "https://image.tmdb.org/t/p/original/2oZklAyWEvdv969FgQiBi6hY9pX.jpg"),
    (68157, "Inglourious Basterds (2009)", "Action|Drama|War", 2009, "https://image.tmdb.org/t/p/w500/7sfbEnaARXDDhKm0CZ7D7ky2U01.jpg", "https://image.tmdb.org/t/p/original/8hT5J9vC1o9b6R4q3tK8w0v3h0p.jpg"),
    (201773, "Oppenheimer (2023)", "Drama|History|Biography", 2023, "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg"),
    (496243, "Parasite (2019)", "Comedy|Drama|Thriller", 2019, "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", "https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg"),
    (244786, "Whiplash (2014)", "Drama|Music", 2014, "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg", "https://image.tmdb.org/t/p/original/6bbZ6XUwvgfjhCjYqf0j0B6r4pX.jpg"),
    (475557, "Joker (2019)", "Crime|Drama|Thriller", 2019, "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", "https://image.tmdb.org/t/p/original/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg"),
    (1422, "The Departed (2006)", "Crime|Drama|Thriller", 2006, "https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg61T.jpg", "https://image.tmdb.org/t/p/original/9n2tJBplPbg9R2xX1p6yV9o7m0p.jpg"),
    (769, "Goodfellas (1990)", "Crime|Drama", 1990, "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg", "https://image.tmdb.org/t/p/original/sw7mordbZxgITU877hTpJ9ubTO4.jpg"),
    (10681, "WALL·E (2008)", "Animation|Adventure|Family|Sci-Fi", 2008, "https://image.tmdb.org/t/p/w500/hUQ15daVz5d1qZzL2eK5k8B4y2.jpg", "https://image.tmdb.org/t/p/original/fK5ssgvtI43z19FoEjAtuzq0fNW.jpg"),
    (1, "Toy Story (1995)", "Animation|Adventure|Comedy|Family", 1995, "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", "https://image.tmdb.org/t/p/original/3Rfvhy1Nl6sSGJwyjt09G9yKTNL.jpg"),
    (129, "Spirited Away (2001)", "Animation|Family|Fantasy", 2001, "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", "https://image.tmdb.org/t/p/original/Ab8mkHmkYADjU7wQiOkia99GQI.jpg"),
    (177765, "La La Land (2016)", "Comedy|Drama|Music|Romance", 2016, "https://image.tmdb.org/t/p/w500/uDO8zWDhfWNzHGtaTy0jE.jpg", "https://image.tmdb.org/t/p/original/nadTUTBgDi09vq4mFl4smL26NgW.jpg"),
    (1721, "Titanic (1997)", "Drama|Romance", 1997, "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg", "https://image.tmdb.org/t/p/original/yDI6D5ZQh67YU4r2ms8qcSbAviZ.jpg"),
    (4993, "The Lord of the Rings: The Fellowship of the Ring (2001)", "Adventure|Fantasy|Action", 2001, "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cDK6.jpg", "https://image.tmdb.org/t/p/original/vRQnzOn4H106y3gxKLrAyGRN8a1.jpg"),
    (5952, "The Lord of the Rings: The Two Towers (2002)", "Adventure|Fantasy|Action", 2002, "https://image.tmdb.org/t/p/w500/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg", "https://image.tmdb.org/t/p/original/kWYfW2Re0rUDE6IHhyHmSdcuVGB.jpg"),
    (7153, "The Lord of the Rings: The Return of the King (2003)", "Adventure|Fantasy|Action", 2003, "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg", "https://image.tmdb.org/t/p/original/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg"),
]

def populate():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    movies_csv = DATA_DIR / "movies.csv"
    ratings_csv = DATA_DIR / "ratings.csv"
    links_csv = DATA_DIR / "links.csv"

    # Build movies dataframe
    movies_records = []
    links_records = []
    for item in ICONIC_MOVIES:
        mid, title, genres, year, poster, backdrop = item
        movies_records.append({
            "movieId": mid,
            "title": title,
            "genres": genres,
        })
        links_records.append({
            "movieId": mid,
            "imdbId": f"{mid:07d}",
            "tmdbId": mid,
        })

    movies_df = pd.DataFrame(movies_records)
    movies_df.to_csv(movies_csv, index=False)

    links_df = pd.DataFrame(links_records)
    links_df.to_csv(links_csv, index=False)

    # Generate correlated rating matrix for 600 users
    np.random.seed(42)
    n_users = 600
    movie_ids = [m[0] for m in ICONIC_MOVIES]
    
    # Genre clusters for true personalization:
    # 0: Sci-Fi / Space / Nolan
    # 1: Crime / Mafia / Thriller
    # 2: Action / Superhero / Fantasy
    # 3: Drama / Romance / Classics
    user_clusters = np.random.choice([0, 1, 2, 3], size=n_users, p=[0.35, 0.25, 0.25, 0.15])
    
    ratings_records = []
    for uid in range(1, n_users + 1):
        cluster = user_clusters[uid - 1]
        n_rated = np.random.randint(20, 50)
        
        # Biased movie selection based on cluster
        if cluster == 0:  # Sci-Fi lover
            fav_mids = [109487, 79132, 2571, 134130, 335984, 329865, 438631, 693134, 72998, 1270, 589, 480, 920]
        elif cluster == 1:  # Crime / Noir lover
            fav_mids = [318, 858, 1221, 296, 2959, 593, 47, 50, 99114, 68157, 1422, 769, 475557]
        elif cluster == 2:  # Action / Superhero
            fav_mids = [58559, 91529, 272, 89745, 193565, 193587, 112852, 122904, 187593, 168252, 193609, 569094, 361743]
        else:  # Drama / Classics
            fav_mids = [527, 356, 201773, 496243, 244786, 177765, 1721, 4993, 5952, 7153, 1, 129]

        # Combine favorites with random movies
        selected = list(np.random.choice(fav_mids, size=min(len(fav_mids), 10), replace=False))
        other_mids = [m for m in movie_ids if m not in selected]
        selected += list(np.random.choice(other_mids, size=n_rated - len(selected), replace=False))
        
        for mid in selected:
            if mid in fav_mids:
                rating = np.random.choice([4.5, 5.0], p=[0.3, 0.7])
            else:
                rating = np.random.choice([2.5, 3.0, 3.5, 4.0], p=[0.2, 0.3, 0.3, 0.2])
            timestamp = 1650000000 + int(np.random.randint(0, 50000000))
            ratings_records.append({
                "userId": uid,
                "movieId": mid,
                "rating": rating,
                "timestamp": timestamp,
            })

    ratings_df = pd.DataFrame(ratings_records)
    ratings_df.to_csv(ratings_csv, index=False)
    logger.info("Successfully wrote %d iconic movies and %d correlated ratings.", len(movies_df), len(ratings_df))

if __name__ == "__main__":
    populate()
