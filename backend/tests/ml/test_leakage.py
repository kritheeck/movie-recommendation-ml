"""Tests for zero test-set leakage validation."""

import pandas as pd
import pytest

from ml.data.splitter import DatasetSplitter
from ml.data.validator import DatasetValidator


def test_split_and_no_leakage():
    # Synthetic ratings
    data = []
    for uid in range(1, 20):
        for mid in range(1, 15):
            data.append({"userId": uid, "movieId": mid, "rating": 4.0, "timestamp": 1000 + mid})
    df = pd.DataFrame(data)

    train, val, test = DatasetSplitter.train_test_split(
        df, test_ratio=0.2, val_ratio=0.1, strategy="user_holdout"
    )
    # Should not raise
    DatasetValidator.assert_no_data_leakage(train, test)


def test_leakage_assertion_triggers():
    train = pd.DataFrame([{"userId": 1, "movieId": 10, "rating": 5.0}])
    test = pd.DataFrame([{"userId": 1, "movieId": 10, "rating": 5.0}])
    with pytest.raises(AssertionError):
        DatasetValidator.assert_no_data_leakage(train, test)
