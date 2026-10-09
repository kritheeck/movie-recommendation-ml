import urllib.request
import pandas as pd

# 62 movies in movies.csv
# Let's map every single one to a guaranteed high-res, valid, 200-OK poster URL
VERIFIED_POSTERS = {
    # 109487: Interstellar
    109487: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    # 79132: Inception
    79132: "https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg",
    # 2571: The Matrix
    2571: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg",
    # 134130: The Martian
    134130: "https://upload.wikimedia.org/wikipedia/en/c/cd/The_Martian_film_poster.jpg",
    # 335984: Blade Runner 2049
    335984: "https://upload.wikimedia.org/wikipedia/en/9/9b/Blade_Runner_2049_poster.png",
    # 329865: Arrival
    329865: "https://upload.wikimedia.org/wikipedia/en/d/df/Arrival%2C_Movie_Poster.jpg",
    # 438631: Dune
    438631: "https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_%282021_film%29.jpg",
    # 693134: Dune: Part Two
    693134: "https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg",
    # 72998: Avatar
    72998: "https://upload.wikimedia.org/wikipedia/en/d/d6/Avatar_%282009_film%29_poster.jpg",
    # 1270: Back to the Future
    1270: "https://upload.wikimedia.org/wikipedia/en/d/d2/Back_to_the_Future.jpg",
    # 589: Terminator 2: Judgment Day
    589: "https://upload.wikimedia.org/wikipedia/en/5/5e/Terminator_2-Judgment_Day.png",
    # 480: Jurassic Park
    480: "https://upload.wikimedia.org/wikipedia/en/e/e7/Jurassic_Park_poster.jpg",
    # 920: 2001: A Space Odyssey
    920: "https://upload.wikimedia.org/wikipedia/en/1/11/2001_A_Space_Odyssey_%281968%29_theatrical_poster_variant.jpg",
    # 157336: Gravity
    157336: "https://upload.wikimedia.org/wikipedia/en/f/f6/Gravity_Poster.jpg",
    # 32: Twelve Monkeys
    32: "https://upload.wikimedia.org/wikipedia/en/c/cf/Twelve_monkeys_imp.jpg",
    # 58559: The Dark Knight
    58559: "https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29_poster.jpg",
    # 91529: The Dark Knight Rises
    91529: "https://upload.wikimedia.org/wikipedia/en/8/83/Dark_knight_rises_poster.jpg",
    # 272: Batman Begins
    272: "https://upload.wikimedia.org/wikipedia/en/a/af/Batman_Begins_Poster.jpg",
    # 89745: The Avengers
    89745: "https://upload.wikimedia.org/wikipedia/en/8/8a/The_Avengers_%282012_film%29_poster.jpg",
    # 193565: Avengers: Infinity War
    193565: "https://upload.wikimedia.org/wikipedia/en/4/4d/Avengers_Infinity_War_poster.jpg",
    # 193587: Avengers: Endgame
    193587: "https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg",
    # 112852: Guardians of the Galaxy
    112852: "https://upload.wikimedia.org/wikipedia/en/3/33/Guardians_of_the_Galaxy_poster.jpg",
    # 122904: Deadpool
    122904: "https://upload.wikimedia.org/wikipedia/en/2/23/Deadpool_%282016_poster%29.png",
    # 187593: Deadpool 2
    187593: "https://upload.wikimedia.org/wikipedia/en/c/cf/Deadpool_2_poster.jpg",
    # 168252: Logan
    168252: "https://upload.wikimedia.org/wikipedia/en/3/37/Logan_2017_poster.jpg",
    # 193609: Spider-Man: Into the Spider-Verse
    193609: "https://upload.wikimedia.org/wikipedia/en/f/fa/Spider-Man_Into_the_Spider-Verse_poster.png",
    # 569094: Spider-Man: Across the Spider-Verse
    569094: "https://upload.wikimedia.org/wikipedia/en/b/b4/Spider-Man-_Across_the_Spider-Verse_poster.jpg",
    # 361743: Top Gun: Maverick
    361743: "https://upload.wikimedia.org/wikipedia/en/1/13/Top_Gun_Maverick_Poster.jpg",
    # 1198: Raiders of the Lost Ark
    1198: "https://upload.wikimedia.org/wikipedia/en/4/4c/Raiders_of_the_Lost_Ark.jpg",
    # 3578: Gladiator
    3578: "https://upload.wikimedia.org/wikipedia/en/f/fb/Gladiator_%282000_film_poster%29.png",
    # 110: Braveheart
    110: "https://upload.wikimedia.org/wikipedia/en/5/55/Braveheart_imp.jpg",
    # 6: Heat
    6: "https://upload.wikimedia.org/wikipedia/en/6/6c/Heatposter.jpg",
    # 245891: John Wick
    245891: "https://upload.wikimedia.org/wikipedia/en/9/98/John_Wick_TeaserPoster.jpg",
    # 76341: Mad Max: Fury Road
    76341: "https://upload.wikimedia.org/wikipedia/en/6/6e/Mad_Max_Fury_Road.jpg",
    # 318: The Shawshank Redemption
    318: "https://upload.wikimedia.org/wikipedia/en/8/81/ShawshankRedemptionMoviePoster.jpg",
    # 858: The Godfather
    858: "https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg",
    # 1221: The Godfather: Part II
    1221: "https://upload.wikimedia.org/wikipedia/en/4/42/The_Godfather_Part_II.jpg",
    # 296: Pulp Fiction
    296: "https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg",
    # 2959: Fight Club
    2959: "https://upload.wikimedia.org/wikipedia/en/f/fc/Fight_Club_poster.jpg",
    # 593: The Silence of the Lambs
    593: "https://upload.wikimedia.org/wikipedia/en/8/86/The_Silence_of_the_Lambs_poster.jpg",
    # 47: Seven
    47: "https://upload.wikimedia.org/wikipedia/en/6/68/Seven_%28movie%29_poster.jpg",
    # 50: The Usual Suspects
    50: "https://upload.wikimedia.org/wikipedia/en/9/9c/Usual_suspects_ver1.jpg",
    # 527: Schindler's List
    527: "https://upload.wikimedia.org/wikipedia/en/3/38/Schindler%27s_List_movie.jpg",
    # 356: Forrest Gump
    356: "https://upload.wikimedia.org/wikipedia/en/6/67/Forrest_Gump_poster.jpg",
    # 4226: Memento
    4226: "https://upload.wikimedia.org/wikipedia/en/c/c7/Memento_poster.jpg",
    # 99114: Django Unchained
    99114: "https://upload.wikimedia.org/wikipedia/en/8/8b/Django_Unchained_Poster.jpg",
    # 68157: Inglourious Basterds
    68157: "https://upload.wikimedia.org/wikipedia/en/c/c3/Inglourious_Basterds_poster.jpg",
    # 201773: Oppenheimer
    201773: "https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg",
    # 496243: Parasite
    496243: "https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29_poster.jpg",
    # 244786: Whiplash
    244786: "https://upload.wikimedia.org/wikipedia/en/0/01/Whiplash_poster.jpg",
    # 475557: Joker
    475557: "https://upload.wikimedia.org/wikipedia/en/e/e1/Joker_%282019_film%29_poster.jpg",
    # 1422: The Departed
    1422: "https://upload.wikimedia.org/wikipedia/en/5/50/Departed234.jpg",
    # 769: Goodfellas
    769: "https://upload.wikimedia.org/wikipedia/en/7/7b/Goodfellas.jpg",
    # 10681: WALL·E
    10681: "https://upload.wikimedia.org/wikipedia/en/c/c2/WALL-Eposter.jpg",
    # 1: Toy Story
    1: "https://upload.wikimedia.org/wikipedia/en/1/13/Toy_Story.jpg",
    # 129: Spirited Away
    129: "https://upload.wikimedia.org/wikipedia/en/d/db/Spirited_Away_Japanese_poster.png",
    # 177765: La La Land
    177765: "https://upload.wikimedia.org/wikipedia/en/a/ab/La_La_Land_%28film%29.png",
    # 1721: Titanic
    1721: "https://upload.wikimedia.org/wikipedia/en/1/18/Titanic_%281997_film%29_poster.png",
    # 4993: LOTR Fellowship
    4993: "https://upload.wikimedia.org/wikipedia/en/8/8a/The_Lord_of_the_Rings_The_Fellowship_of_the_Ring_%282001%29.jpg",
    # 5952: LOTR Two Towers
    5952: "https://upload.wikimedia.org/wikipedia/en/d/d0/Lord_of_the_Rings_-_The_Two_Towers_%282002%29.jpg",
    # 7153: LOTR Return of King
    7153: "https://upload.wikimedia.org/wikipedia/en/b/be/The_Lord_of_the_Rings_-_The_Return_of_the_King_%282003%29.jpg",
}

print(f"Total posters in dict: {len(VERIFIED_POSTERS)}")
failed = []
for mid, url in VERIFIED_POSTERS.items():
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status != 200:
                failed.append((mid, url, resp.status))
    except Exception as e:
        failed.append((mid, url, str(e)))

print(f"FAILED: {len(failed)}")
if failed:
    for f in failed:
        print("  FAIL:", f)
else:
    print("ALL 61 POSTERS VERIFIED 100% OK!")
