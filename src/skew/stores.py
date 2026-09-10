"""Offline history (sqlite standing in for Postgres) and online latest (dict for Redis)."""

import sqlite3

from . import const


class Offline:
    """entity_id, feature, value, event_time — same columns as the Postgres table."""

    def __init__(self):
        self.db = sqlite3.connect(":memory:")
        self.db.execute(
            "CREATE TABLE feature_hist ("
            "entity_id TEXT NOT NULL, feature TEXT NOT NULL, "
            "value REAL NOT NULL, event_time INTEGER NOT NULL)"
        )
        self.db.execute(
            "CREATE INDEX idx_hist ON feature_hist (entity_id, feature, event_time)"
        )

    def put(self, entity_id, feature, value, event_time):
        self.db.execute(
            "INSERT INTO feature_hist VALUES (?, ?, ?, ?)",
            (entity_id, feature, value, event_time),
        )

    def commit(self):
        self.db.commit()

    def window_sum(self, entity_id, feature, end, hours=const.WINDOW_HOURS):
        start = end - hours + 1
        row = self.db.execute(
            "SELECT COALESCE(SUM(value), 0) FROM feature_hist "
            "WHERE entity_id = ? AND feature = ? AND event_time BETWEEN ? AND ?",
            (entity_id, feature, start, end),
        ).fetchone()
        return float(row[0])


class Online:
    """Redis hash stand-in: one latest value per (entity_id, feature)."""

    def __init__(self, missing_as_zero=False):
        self._h = {}
        self.missing_as_zero = missing_as_zero

    def set(self, entity_id, feature, value):
        self._h[(entity_id, feature)] = float(value)

    def get(self, entity_id, feature):
        key = (entity_id, feature)
        if key in self._h:
            return self._h[key]
        if self.missing_as_zero:
            return 0.0
        return None
