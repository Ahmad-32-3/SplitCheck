// Every number the page shows lives here, on purpose.
// Measured by scripts/run.py on the planted 5,000-entity set (seed 7).

export const ILLUSTRATIVE = false

export const METRICS = {
  successPct: 100.0,
  baselinePct: 0.0,
  nEntities: 5000,
  nPlanted: 1200,
  nCaught: 1200,
  nClean: 3800,
  seed: 7,
  store: 'memory',
  windowHours: 24,
}

export const ABLATION = [
  { key: 'window', label: 'Window off by one hour', successPct: 100, n: 400 },
  { key: 'missing_zero', label: 'Missing cache treated as zero', successPct: 100, n: 400 },
  { key: 'casing', label: 'Account id letter case', successPct: 100, n: 400 },
] as const

// One account, 24 hourly spends. Postgres sums all 24. Redis drops the oldest
// hour (the window bug). The two totals are what a live score would disagree on.
export const PROBLEM_HOURS = [
  4.2, 6.1, 5.4, 7.8, 3.9, 8.2, 6.7, 5.1, 9.0, 4.6, 7.3, 5.8, 6.4, 8.1, 4.9, 7.0, 5.5, 6.8, 8.6,
  4.4, 7.7, 5.2, 6.0, 8.9,
]

export const PROBLEM = {
  entityId: 'Acct_0000',
  hours: PROBLEM_HOURS,
  postgres: PROBLEM_HOURS.reduce((a, b) => a + b, 0),
  redis: PROBLEM_HOURS.slice(1).reduce((a, b) => a + b, 0),
}

export type Counter = { key: string; label: string; value: number; unit: string; note: string }
export const COUNTERS: Counter[] = [
  {
    key: 'detector',
    label: 'Checker catch rate',
    value: METRICS.successPct,
    unit: '%',
    note: 'share of planted-bad rows it flagged',
  },
  {
    key: 'naive',
    label: 'Naive baseline',
    value: METRICS.baselinePct,
    unit: '%',
    note: 'always says the two stores match',
  },
  {
    key: 'entities',
    label: 'Accounts in the set',
    value: METRICS.nEntities,
    unit: '',
    note: 'capped at 5,000, seed 7',
  },
  {
    key: 'planted',
    label: 'Rows I made wrong on purpose',
    value: METRICS.nPlanted,
    unit: '',
    note: `${METRICS.nCaught} of them flagged`,
  },
]

export const DECISIONS = [
  {
    first: 'Rebuild a feature platform',
    built: 'One parity check: same 24-hour sum on both stores',
  },
  {
    first: 'Wait for a real production incident',
    built: 'Plant three known bugs and score the checker against them',
  },
  {
    first: 'Report one catch rate',
    built: 'Print the checker next to a naive baseline that never flags',
  },
] as const

export type Tool = { name: string; tag: string; plain: string; tech: string }
export const STACK: Tool[] = [
  {
    name: 'Python',
    tag: 'plant',
    plain: 'Builds the accounts, writes the history, and plants the three bugs.',
    tech: 'Fixed seed, 5,000 mixed-case account ids, 36 hourly spends each. The live 24-hour sum is the feature both stores should agree on.',
  },
  {
    name: 'sqlite (Postgres stand-in)',
    tag: 'offline',
    plain: 'The training store: a table of entity, feature, value, and time.',
    tech: 'Same columns as the DESIGN Postgres table. Docker was down, so sqlite in process holds the history. Compose still names postgres.',
  },
  {
    name: 'dict (Redis stand-in)',
    tag: 'online',
    plain: 'The scoring store: the latest feature value per account.',
    tech: 'A hash keyed by account id. Missing keys read as zero, which is one of the planted bugs. Compose still names redis.',
  },
  {
    name: 'parity checker',
    tag: 'detect',
    plain: 'Recomputes the 24-hour sum from history and compares it to the cache.',
    tech: 'Same window function on both sides. A row is flagged when the values differ. Scoring never sees the planted labels.',
  },
  {
    name: 'pytest',
    tag: 'leak',
    plain: 'Fails the run if scoring is handed the planted labels.',
    tech: 'tests/test_eval.py injects bug_type onto the score payload and expects ValueError: leak.',
  },
  {
    name: 'Vite, React, motion',
    tag: 'page',
    plain: 'Builds this page and draws the charts from data.ts.',
    tech: 'No API. The numbers above are the measured run. Charts are hand SVG (Bklit line / Kokonut bento pattern).',
  },
]

export const NEXT = [
  'Wire the same checker to Compose postgres and redis once the Docker daemon is up. The schema already matches.',
  'Kafka into Redis is optional. Skip it until the Postgres vs Redis check is running on real services.',
  'Add a fourth bug (stale cache older than the window) only if a live system actually does that.',
]

export const SECTORS = [
  {
    name: 'Fraud scoring',
    job: 'A fraud model trained on warehouse history will bless traffic that Redis is scoring from a shorter window or a missing key.',
  },
  {
    name: 'Ads ranking',
    job: 'Bid features that disagree by an hour shift who wins the auction, with no training metric to show it.',
  },
  {
    name: 'Marketplace risk',
    job: 'Account-level spend or listing counts that Redis lowercases will miss the warehouse row and look like a quiet account.',
  },
]
