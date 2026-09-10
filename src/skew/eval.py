"""success_pct = share of planted-bad rows the checker flags. Naive always says match."""

from .ablate import ablation
from .parity import detect, score_rows


def naive_flags(rows):
    return [False] * len(rows)


def _catch_rate(flags, labels, entities):
    planted = [i for i, eid in enumerate(entities) if labels[eid] is not None]
    if not planted:
        return 0.0, 0, 0
    caught = sum(1 for i in planted if flags[i])
    return 100.0 * caught / len(planted), caught, len(planted)


def evaluate(world):
    rows = score_rows(world)
    flags = detect(rows)
    success_pct, n_caught, n_planted = _catch_rate(flags, world.labels, world.entities)
    base_pct, _, _ = _catch_rate(naive_flags(rows), world.labels, world.entities)
    return {
        "success_pct": success_pct,
        "baseline_pct": base_pct,
        "n_caught": n_caught,
        "n_planted": n_planted,
        "n_entities": world.n_entities,
        "n_clean": world.n_entities - n_planted,
        "seed": world.seed,
        "store": world.store,
        "ablation": ablation(world),
    }


def print_report(m):
    print(
        f"detector success_pct {m['success_pct']:.1f}  |  "
        f"naive baseline {m['baseline_pct']:.1f}  |  "
        f"caught {m['n_caught']}/{m['n_planted']}  |  "
        f"n_entities {m['n_entities']} store {m['store']}"
    )
    bits = "  ".join(
        f"{r['bug_type']} {r['success_pct']:.1f}" for r in m.get("ablation", [])
    )
    if bits:
        print("ablation", bits)
