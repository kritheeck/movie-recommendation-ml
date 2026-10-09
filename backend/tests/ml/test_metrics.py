"""Unit tests for evaluation metrics (NDCG, Precision, Recall, RMSE, MAE)."""

from ml.evaluation.metrics import MetricEvaluator


def test_compute_ranking_perfect():
    recs = [1, 2, 3, 4, 5]
    relevant = {1, 2, 3}
    res = MetricEvaluator.compute_ranking_metrics_for_user(recs, relevant, k=5)
    assert res["precision"] == 3 / 5
    assert res["recall"] == 1.0
    assert res["ndcg"] > 0.9


def test_compute_ranking_zero():
    recs = [10, 11, 12]
    relevant = {1, 2, 3}
    res = MetricEvaluator.compute_ranking_metrics_for_user(recs, relevant, k=3)
    assert res["precision"] == 0.0
    assert res["recall"] == 0.0
    assert res["ndcg"] == 0.0


def test_compute_rmse_and_mae():
    preds = [(3.0, 4.0), (4.0, 4.0), (5.0, 3.0)]  # errors: 1, 0, 2
    rmse = MetricEvaluator.compute_rmse(preds)
    mae = MetricEvaluator.compute_mae(preds)
    assert round(mae, 2) == 1.0
    assert round(rmse, 2) == 1.29
