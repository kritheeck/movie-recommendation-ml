# Ethics Statement

**Study title:** Movie Recommendation System
**Course:** Research Methodologies and Experimental Design, CSE-A

---

## Commitments

### 1. No real personal data
- All users in the demo are **anonymous identifiers** generated at session start.
- No name, email, password, or identifying information is ever collected or stored.
- The only stored data per user: a UUID, a display name (user-chosen, any string), movie ratings, feedback votes.

### 2. Data used only for the stated research purpose
- All data collected (ratings, feedback) is used exclusively to:
  - Demonstrate the recommendation system functionality.
  - Compute the satisfaction proxy metric for the research study.
- Data is not sold, shared, or used for advertising.

### 3. No analytics or tracking
- No third-party analytics scripts are included.
- No page-view tracking, no fingerprinting, no cookies beyond session state.
- The only optional external call is to TMDB for movie poster images, and this requires explicit configuration of an API key.

### 4. Right to deletion
- Every demo user can delete their account and all associated data (ratings, feedback, votes) via a single "Delete my data" action in the UI.
- This removes all rows from `demo_users`, `user_ratings`, `feedback`, and `blind_votes` via cascade delete.

### 5. TMDB (optional)
- If a TMDB API key is configured, poster images are fetched from TMDB's CDN.
- The app is **fully functional without this key** — poster images fall back to genre-colored placeholders.
- TMDB key is stored in the `.env` file and never committed to version control.
- Users are not identified to TMDB in any way.

### 6. Dataset license
- The MovieLens ml-latest-small dataset is provided by GroupLens Research, University of Minnesota.
- It is used under the [GroupLens Terms of Use](https://grouplens.org/datasets/movielens/).
- The dataset is **not committed to this repository**. It is downloaded by `scripts/download_data.py`.
- Any publication using this dataset must cite:
  > F. Maxwell Harper and Joseph A. Konstan. 2015. The MovieLens Datasets: History and Context.
  > ACM Transactions on Interactive Intelligent Systems, 5(4): 19:1–19:19.
  > https://doi.org/10.1145/2827872

### 7. Honesty of results
- No metric is fabricated, hard-coded, or rounded up.
- Every number shown in the UI comes from an experiment artifact stored on disk.
- Limitations of the evaluation (offline metrics, small dataset, popularity bias) are documented and shown in the UI.
