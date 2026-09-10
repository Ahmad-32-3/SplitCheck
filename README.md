# SplitCheck

In a live product, the model rarely reads raw events at score time. A batch job writes features into Postgres. Redis keeps the latest feature values for each user so scoring stays quick.

Those two stores can disagree. A window can be off by one hour. A missing cache value can be treated as zero. A join key can differ only by letter case. The notebook trained on Postgres history. Production scored Redis. The model looks fine in training and wrong in production. That mismatch is training-serving skew.

I plant those bugs on a set of entities, recompute the offline feature the same way I would for training, read the online value from Redis, and run a parity checker that flags rows that do not match. I score the checker against a naive baseline that always says everything matches. When I know which rows are wrong, how often does the checker catch them?

## Run

```bash
python -m pytest tests/ -q
python scripts/run.py
npm --prefix web install
npm --prefix web run dev
```

Compose brings up Postgres and Redis when Docker is available. If it is not, leak tests and the walkthrough still run. The CLI prints a one-line blocker.

## Layout

- `src/` planted skew, parity logic, eval
- `scripts/run.py` prints detector catch rate vs the naive baseline
- `tests/` leak / false-green checks
- `web/` case-study page
