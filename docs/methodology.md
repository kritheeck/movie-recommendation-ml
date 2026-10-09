# Study Methodology

**Study title:** Movie Recommendation System
**Course:** Research Methodologies and Experimental Design, CSE-A

---

## 1. Research Question

> Can a personalized recommendation system (collaborative, content-based, or hybrid filtering)
> improve recommendation accuracy and user satisfaction compared with a non-personalized system?

---

## 2. Research Paradigm

- **Paradigm:** Quantitative
- **Design:** Quasi-experimental, simulation-based computational experiment
- **Data source:** MovieLens ml-latest-small (~100k ratings, ~9k movies, ~600 users)
  [(GroupLens license)](https://grouplens.org/datasets/movielens/)

---

## 3. Variables

| Variable type | Variable | Definition | Measurement |
|---|---|---|---|
| **Independent** | Recommendation algorithm | Which model generates recommendations | Categorical: Baseline / UserKNN / ItemKNN / MF / CB / Hybrid |
| **Independent** | Data input | Ratings provided by a user | Count and distribution of ratings |
| **Dependent** | Accuracy | Fraction of held-out ratings predicted as "relevant" (≥4.0) vs actual relevance | Classification accuracy at threshold 4.0 |
| **Dependent** | Precision@K | Fraction of top-K recommendations that are relevant | Rating ≥4.0 in held-out set |
| **Dependent** | Recall@K | Fraction of relevant items that appear in top-K | Rating ≥4.0 in held-out set |
| **Dependent** | MAE | Mean absolute error of rating predictions | Lower is better |
| **Dependent** | RMSE | Root mean squared error of rating predictions | Lower is better |
| **Dependent** | NDCG@K | Normalised discounted cumulative gain | Higher is better |
| **Dependent** | Coverage | Fraction of catalog recommended at least once across all users | Higher = less popularity bias |
| **Dependent** | Novelty | Mean popularity rank of recommended items | Higher = less popular items |
| **Dependent** | User satisfaction (proxy) | Thumbs-up rate and mean star rating from in-app feedback | Small-sample proxy only; see §6 |

---

## 4. Control Variables

The following are held constant across **every** model to ensure fair comparison:

| Control | Value | Implementation |
|---|---|---|
| Dataset | MovieLens ml-latest-small | `scripts/download_data.py` with checksum |
| Preprocessing | Same cleaning, genre parsing, year extraction | `ml/data/preprocessor.py` |
| Train/val/test split | 70/10/20 random per-user, seed=42, indices persisted | `ml/data/splitter.py` |
| Evaluation metric code | Identical metric functions for all models | `ml/evaluation/metrics.py` |
| Top-K | 10 (configurable) | `Settings.top_k` |
| Relevance threshold | 4.0 stars | `Settings.relevance_threshold` (Phase 3) |
| Number of seeds | 5 (configurable) | `Settings.n_eval_seeds` |

---

## 5. Models

| Model | Type | Role |
|---|---|---|
| **PopularityBaseline** | Non-personalized (Bayesian damped mean) | Control group |
| **UserKNN** | Collaborative filtering (user-based) | Experimental group |
| **ItemKNN** | Collaborative filtering (item-based) | Experimental group |
| **MatrixFactorization** | Collaborative filtering (SVD-style) | Experimental group |
| **ContentBased** | TF-IDF genre/tag profile matching | Experimental group |
| **Hybrid** | Weighted CF + CB blend (alpha tuned on val split) | Experimental group |

Cold-start handling: users with fewer than N ratings fall back to Popularity + ContentBased.
New items fall back to ContentBased. This behaviour is documented and tested in `ml/cold_start.py`.

---

## 6. User Satisfaction

Offline metrics cannot measure real user satisfaction. The app implements an **in-app feedback loop**:
- Each recommendation card has thumbs up/down and an optional 1–5 star rating.
- Stored per `(session_user, model, item)`.
- The Experiment Lab shows a **satisfaction proxy** (thumbs-up rate and mean rating) per model.

**Limitations (stated explicitly in the UI):**
- Small sample (demo users only — anonymous, no real-world users).
- Self-selection bias (users who give feedback may differ from those who do not).
- This is not a validated satisfaction measure and is not used in the statistical comparison.

---

## 7. Statistical Rigor

- Each model is evaluated with **5 seeds** (default). Results are reported as **mean ± SD**.
- **Paired t-test and Wilcoxon signed-rank test** are run between each personalized model and the
  PopularityBaseline across per-user metric values.
- Significance level: p < 0.05. Effect size reported where significant.
- No p-hacking: all tests are pre-registered in `config.json` before results are produced.

---

## 8. Validity, Reliability, Reproducibility, Ethics

| Quality | How it is ensured |
|---|---|
| **Internal validity** | Identical split, preprocessing, and metrics for all models; no test-set tuning |
| **External validity** | Acknowledged limitation: offline evaluation on one dataset does not generalize to all users |
| **Reliability** | Multi-seed evaluation + fixed split indices; `make reproduce RUN=<id>` re-creates exact metrics |
| **Reproducibility** | Every artifact folder contains `config.json` with git commit, library versions, dataset checksum |
| **Ethics** | No real personal data; demo users are anonymous IDs; no analytics; data used only for stated purpose; documented in `docs/ETHICS.md` |

---

## 9. Pipeline

```
Data Acquisition → Preprocessing → Train/Val/Test Split → Model Training
    → Recommendation → Evaluation → Significance Testing → Artifact Writing → Report
```

Each step is implemented as a separate, tested module. See the architecture section of `README.md`.

---

*This document is the single source of truth for the study design.
The Methodology page in the UI renders this file directly.*
