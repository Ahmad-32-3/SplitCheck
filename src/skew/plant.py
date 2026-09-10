"""Generate a strong entity set and plant the three DESIGN mismatch types."""

import random
from dataclasses import dataclass

from . import const
from .stores import Offline, Online


@dataclass
class World:
    offline: Offline
    online: Online
    entities: list
    labels: dict  # entity_id -> bug_type or None
    score_hour: int
    n_entities: int
    seed: int
    store: str = "memory"

    @property
    def n_planted(self):
        return sum(1 for v in self.labels.values() if v is not None)


def _ids(n):
    # Mixed case so a casing bug is a real key miss, not a no-op.
    return [f"Acct_{i:04d}" for i in range(n)]


def _spend(rng, hour):
    # Always > 0 so an off-by-one window cannot accidentally match.
    return 1.0 + rng.random() * 9.0 + (hour % 7)


def plant(n_entities=const.N_ENTITIES, seed=const.SEED, n_per_bug=const.N_PER_BUG):
    if n_entities > const.N_ENTITIES:
        raise ValueError(f"cap: {n_entities} entities over {const.N_ENTITIES}")
    rng = random.Random(seed)
    n_per_bug = min(n_per_bug, max(1, n_entities // 6))
    ids = _ids(n_entities)
    bugs = {}
    i = 0
    for kind in const.BUG_TYPES:
        for _ in range(n_per_bug):
            bugs[ids[i]] = kind
            i += 1

    offline = Offline()
    online = Online(missing_as_zero=True)  # production read path treats a miss as 0
    score_hour = const.HISTORY_HOURS - 1
    for eid in ids:
        for h in range(const.HISTORY_HOURS):
            offline.put(eid, const.FEATURE, _spend(rng, h), h)
    offline.commit()

    for eid in ids:
        kind = bugs.get(eid)
        true = offline.window_sum(eid, const.FEATURE, score_hour)
        if kind == "window":
            # Online used 23 hours instead of 24.
            online.set(eid, const.FEATURE, offline.window_sum(eid, const.FEATURE, score_hour, hours=23))
        elif kind == "missing_zero":
            pass  # no Redis key; getter returns 0
        elif kind == "casing":
            online.set(eid.lower(), const.FEATURE, true)
        else:
            online.set(eid, const.FEATURE, true)

    labels = {eid: bugs.get(eid) for eid in ids}
    return World(
        offline=offline,
        online=online,
        entities=ids,
        labels=labels,
        score_hour=score_hour,
        n_entities=n_entities,
        seed=seed,
    )
