"""Catch rate by planted mismatch type. Same detect() as the headline metric."""

from . import const
from .parity import detect, score_rows


def ablation(world):
    rows = score_rows(world)
    flags = detect(rows)
    out = []
    for kind in const.BUG_TYPES:
        idx = [i for i, eid in enumerate(world.entities) if world.labels[eid] == kind]
        n = len(idx)
        caught = sum(1 for i in idx if flags[i])
        pct = 100.0 * caught / n if n else 0.0
        out.append({"bug_type": kind, "success_pct": pct, "n": n, "caught": caught})
    return out
