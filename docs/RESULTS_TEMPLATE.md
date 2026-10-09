# Results Report — Auto-filled Template

> **How to use:** Run `make experiment` to produce an artifact folder.
> Then run `make reproduce RUN=<id>` to verify.
> The values below marked `{{...}}` are filled in automatically from `metrics.json`.

---

## Study: Movie Recommendation System

**Research question:** Can a personalized recommendation system improve recommendation
accuracy and user satisfaction compared with a non-personalized system?

**Experiment ID:** `{{experiment_id}}`
**Run date:** `{{run_date}}`
**Dataset:** MovieLens ml-latest-small ({{n_ratings}} ratings, {{n_users}} users, {{n_items}} items)
**Git commit:** `{{git_commit}}`
**Split strategy:** `{{split_strategy}}` (seed {{seed}}, train {{train_pct}}% / val {{val_pct}}% / test {{test_pct}}%)
**Seeds evaluated:** {{n_seeds}}

---

## Results Table

| Model | MAE (↓) | RMSE (↓) | Accuracy (↑) | Precision@10 (↑) | Recall@10 (↑) | NDCG@10 (↑) | Coverage (↑) | Novelty (↑) |
|---|---|---|---|---|---|---|---|---|
| PopularityBaseline | {{baseline_mae}} ± {{baseline_mae_sd}} | {{baseline_rmse}} ± {{baseline_rmse_sd}} | {{baseline_acc}} ± {{baseline_acc_sd}} | {{baseline_p10}} ± {{baseline_p10_sd}} | {{baseline_r10}} ± {{baseline_r10_sd}} | {{baseline_ndcg}} ± {{baseline_ndcg_sd}} | {{baseline_cov}} | {{baseline_nov}} |
| UserKNN | {{uknn_mae}} ± {{uknn_mae_sd}} | ... | ... | ... | ... | ... | ... | ... |
| ItemKNN | ... | ... | ... | ... | ... | ... | ... | ... |
| MatrixFactorization | ... | ... | ... | ... | ... | ... | ... | ... |
| ContentBased | ... | ... | ... | ... | ... | ... | ... | ... |
| Hybrid | ... | ... | ... | ... | ... | ... | ... | ... |

**Accuracy definition:** Fraction of held-out ratings that the model correctly classified as
relevant (predicted ≥ 4.0) or not relevant (predicted < 4.0). Threshold = 4.0 stars.

---

## Statistical Significance (vs PopularityBaseline)

| Model | Test | p-value | Significant (p<0.05)? | Direction |
|---|---|---|---|---|
| UserKNN | Paired t-test | {{uknn_p}} | {{uknn_sig}} | {{uknn_dir}} |
| ItemKNN | Paired t-test | ... | ... | ... |
| MatrixFactorization | Paired t-test | ... | ... | ... |
| ContentBased | Paired t-test | ... | ... | ... |
| Hybrid | Paired t-test | ... | ... | ... |

---

## Satisfaction Proxy (in-app feedback — small sample, not validated)

| Model | Thumbs-up rate | Mean star rating | N feedback |
|---|---|---|---|
| PopularityBaseline | {{baseline_thumbs}} | {{baseline_stars}} | {{baseline_n_fb}} |
| ... | ... | ... | ... |

**Caveat:** This is a small-sample online proxy collected from anonymous demo sessions.
It should not be interpreted as a validated user satisfaction measure.

---

## Known Limitations

1. **Offline evaluation only.** Offline metrics (precision, recall, NDCG) do not equal real-world
   user satisfaction. A live A/B test would be required to validate real-world impact.
2. **Small dataset.** ml-latest-small has ~600 users; results may not generalize to larger populations.
3. **Popularity bias.** All models exhibit some degree of popularity bias (recommending well-known films more often). Coverage and novelty metrics quantify this.
4. **Cold-start.** Users with fewer than {{min_user_ratings}} ratings receive degraded recommendations from the fallback (Popularity + ContentBased). This is documented but not deeply evaluated here.
5. **Single dataset.** All results are for MovieLens only. Generalizability to other domains is unknown.
6. **Satisfaction proxy.** The in-app thumbs-up metric is a convenience sample from anonymous demo users and carries no statistical weight.

---

## Citation

> F. Maxwell Harper and Joseph A. Konstan. 2015. The MovieLens Datasets: History and Context.
> ACM Transactions on Interactive Intelligent Systems, 5(4): 19:1–19:19.
> https://doi.org/10.1145/2827872
