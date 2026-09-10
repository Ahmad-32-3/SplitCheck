# DESIGN defaults. Change a knob with one ADR line.

N_ENTITIES = 5000
SEED = 7
WINDOW_HOURS = 24
HISTORY_HOURS = 36
FEATURE = "spend_24h"
EPS = 1e-9
FLOOR_PCT = 85.0
N_PER_BUG = 400
BUG_TYPES = ("window", "missing_zero", "casing")
ILLEGAL_SCORE_KEYS = frozenset({"bug_type", "planted", "is_bad", "label"})
