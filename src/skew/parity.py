"""Recompute the offline window, read Redis, flag a mismatch. No labels on this path."""

from . import const


def check_no_leak(rows):
    for row in rows:
        hit = const.ILLEGAL_SCORE_KEYS.intersection(row)
        if hit:
            raise ValueError(f"leak: scoring saw {sorted(hit)}")


def score_rows(world):
    """Values only. Planted bug types stay off this payload."""
    rows = []
    for eid in world.entities:
        off = world.offline.window_sum(eid, const.FEATURE, world.score_hour)
        on = world.online.get(eid, const.FEATURE)
        rows.append({"entity_id": eid, "offline": off, "online": on})
    check_no_leak(rows)
    return rows


def is_mismatch(offline, online, eps=const.EPS):
    if online is None:
        return True
    return abs(offline - online) > eps


def detect(rows):
    check_no_leak(rows)
    return [is_mismatch(r["offline"], r["online"]) for r in rows]
