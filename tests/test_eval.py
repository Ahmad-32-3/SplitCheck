import pytest

from skew.ablate import ablation
from skew.eval import evaluate, naive_flags
from skew.parity import check_no_leak, score_rows
from skew.plant import plant


def test_leak_injection_fails():
    """Scoring must not see planted labels. Injecting them has to raise."""
    world = plant(n_entities=60, seed=1)
    leaked = [{**row, "bug_type": "window"} for row in score_rows(world)]
    with pytest.raises(ValueError, match="leak"):
        check_no_leak(leaked)


def test_caps():
    world = plant()
    assert world.n_entities <= 5000
    m = evaluate(world)
    assert m["n_entities"] <= 5000
    assert m["n_entities"] == world.n_entities


def test_naive_never_flags():
    world = plant(n_entities=90, seed=2)
    flags = naive_flags(score_rows(world))
    assert not any(flags)
    m = evaluate(world)
    assert m["baseline_pct"] == 0.0


def test_detector_beats_naive_on_planted():
    world = plant(n_entities=900, seed=7)
    m = evaluate(world)
    assert m["n_planted"] > 0
    assert m["success_pct"] >= 85
    assert m["success_pct"] > m["baseline_pct"]
    assert m["baseline_pct"] == 0.0


def test_ablation_has_three_mismatch_types():
    world = plant(n_entities=900, seed=7)
    rows = ablation(world)
    assert [r["bug_type"] for r in rows] == ["window", "missing_zero", "casing"]
    for r in rows:
        assert r["n"] > 0
        assert r["success_pct"] >= 85
    m = evaluate(world)
    assert [r["bug_type"] for r in m["ablation"]] == ["window", "missing_zero", "casing"]
