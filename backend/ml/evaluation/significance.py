"""Statistical significance tests (t-test / Wilcoxon signed-rank) comparing models to baseline."""

from __future__ import annotations

import numpy as np
from scipy import stats


class SignificanceTester:
    """Computes p-values and confidence intervals vs baseline across multiple seeds."""

    @staticmethod
    def paired_t_test(
        baseline_scores: list[float], model_scores: list[float]
    ) -> dict[str, float | bool]:
        """Paired t-test comparing a candidate model to the baseline."""
        if len(baseline_scores) < 2 or len(baseline_scores) != len(model_scores):
            return {"t_stat": 0.0, "p_value": 1.0, "statistically_significant": False}

        t_stat, p_val = stats.ttest_rel(model_scores, baseline_scores)
        # Check if NaN
        if np.isnan(p_val):
            p_val = 1.0
            t_stat = 0.0

        return {
            "t_stat": round(float(t_stat), 4),
            "p_value": round(float(p_val), 5),
            "statistically_significant": bool(p_val < 0.05),
        }
