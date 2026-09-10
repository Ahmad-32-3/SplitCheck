"""Planted skew -> parity check -> metrics.json. Prints detector vs naive baseline.

Docker down: in-process sqlite + dict (ADR). Numbers are still measured on the planted set.
"""

import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from skew.eval import evaluate, print_report
from skew.plant import plant

METRICS = "metrics.json"


def main():
    world = plant()
    m = evaluate(world)
    with open(METRICS, "w") as f:
        json.dump(m, f, indent=2)
    print_report(m)
    if world.store == "memory":
        print("BLOCKER: docker daemon down; in-process sqlite+dict stand in for postgres/redis (ADR).")


if __name__ == "__main__":
    main()
