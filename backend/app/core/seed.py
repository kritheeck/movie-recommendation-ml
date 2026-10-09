"""Global seeding utility.

Call ``seed_everything(seed)`` once at startup (or at the start of each
experiment run) to make NumPy, random, and scikit-learn reproducible.

ML code imports only this module — never the web layer — so it remains
independently testable.
"""

from __future__ import annotations

import random

import numpy as np


def seed_everything(seed: int) -> None:
    """Set all global random seeds deterministically."""
    random.seed(seed)
    np.random.seed(seed)
    # scikit-learn uses numpy's global state; no separate call needed.
    # If torch were used we would set it here too, but it is out of scope.
