import { CatchChart } from './components/story/CatchChart'
import { DualStore } from './components/story/DualStore'
import { PlantViz } from './components/story/PlantViz'
import { ResultBento } from './components/story/ResultBento'
import { StackGrid } from './components/story/StackGrid'
import { StoryBeat } from './components/story/StoryBeat'
import { DECISIONS, ILLUSTRATIVE, METRICS, NEXT, SECTORS } from './data'

const TOC = [
  { href: '#problem', label: 'The problem' },
  { href: '#answer', label: 'The approach' },
  { href: '#result', label: 'The result' },
  { href: '#stack', label: 'How it works' },
  { href: '#decisions', label: 'Design choices' },
  { href: '#use', label: 'Running it' },
]

export function App() {
  return (
    <>
      <a className="skip-link" href="#problem">
        Skip to the walkthrough
      </a>

      <div className="masthead">
        <div className="masthead__inner">
          <div className="masthead__mark">
            <b>SplitCheck</b> · when the training store and the scoring store disagree
          </div>
          <ul className="masthead__nav">
            <li>
              <a href="#problem">problem</a>
            </li>
            <li>
              <a href="#result">result</a>
            </li>
            <li>
              <a href="#decisions">choices</a>
            </li>
            <li>
              <a href="#use">run</a>
            </li>
          </ul>
        </div>
      </div>

      <main className="page">
        <header className="page-hero">
          <p className="meta">A walkthrough · catching mismatch between Postgres history and Redis</p>
          <h1>SplitCheck</h1>
          <p className="lead">
            In a live product the model rarely reads raw events at score time. A batch job writes
            features into Postgres. Redis keeps the latest value for each account so scoring stays
            quick. Those two stores can disagree. I plant those disagreements on purpose, then I
            measure how often a parity checker catches them.
          </p>
          <p className="intro-detail">
            The number I stand behind is catch rate: of the rows I made wrong, how many did the
            checker flag. A naive check that always says &quot;they match&quot; is the baseline. This
            run used {METRICS.nEntities.toLocaleString()} accounts and seed {METRICS.seed}.
            {ILLUSTRATIVE ? ' The numbers here are placeholders.' : ''}
          </p>
          <nav aria-label="On this page">
            <ul className="toc">
              {TOC.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <StoryBeat
          id="problem"
          kicker="The problem"
          title="The notebook trained on one store. Production scored the other."
          caption={`${PROBLEM_CAPTION} The faded first bar is the hour Redis dropped. Postgres still has it, so the 24-hour sums differ.`}
          visual={<DualStore />}
        >
          <p>
            I train a model on feature history sitting in Postgres. At serving time the same feature
            is supposed to come from Redis, which only keeps the latest value per account. If a
            window is off by one hour, if a missing cache key is treated as zero, or if the account
            id differs only by letter case, the two numbers are not the same feature any more.
          </p>
          <p>
            The model still looks fine in training. The live score is wrong. That gap is what people
            call training-serving skew. I wanted a check that fires on the mismatch itself, before I
            trust a live score.
          </p>
        </StoryBeat>

        <StoryBeat
          id="answer"
          kicker="The approach"
          title="Same 24-hour sum, two stores, planted bugs"
          caption="I know which rows are wrong because I wrote the bugs. The checker is not allowed to see those labels. It only compares the two numbers."
          visual={<PlantViz />}
        >
          <p>
            Each account has 36 hours of spend. The feature is the sum of the last 24 hours. I write
            that history into the offline table. I write a latest value into the cache. For most
            accounts those two agree. For 1,200 of them I plant one of three bugs: a 23-hour window
            instead of 24, a missing key that reads as zero, or a cache key stored in lowercase while
            lookup still uses mixed case.
          </p>
          <p>
            The checker recomputes the 24-hour sum from history, reads the cache, and flags a row
            when the values differ. I then score it against the planted labels. The naive baseline
            never flags anything, so its catch rate is zero on the same set.
          </p>
        </StoryBeat>

        <StoryBeat
          id="result"
          kicker="The result"
          title="The checker caught every planted row"
          caption={`Catch rate on the planted-bad rows. The checker is ${METRICS.successPct.toFixed(0)}%. The naive baseline is ${METRICS.baselinePct.toFixed(0)}%. The three bars under that are the same protocol, split by bug type.`}
          visual={<CatchChart />}
        >
          <p>
            Catch rate is the share of planted-bad rows the checker flagged. Floor is 85%. I want it
            much higher than that on a frozen protocol. This run is {METRICS.successPct.toFixed(0)}%
            against a {METRICS.baselinePct.toFixed(0)}% baseline, on {METRICS.nCaught.toLocaleString()} of{' '}
            {METRICS.nPlanted.toLocaleString()} planted rows, with {METRICS.nEntities.toLocaleString()}{' '}
            accounts in the set.
          </p>
          <ResultBento />
          <p style={{ marginTop: 'var(--space-5)' }}>
            The bugs were loud on purpose. An off-by-one hour still changes the sum because every
            hour has spend. A missing key is zero against a positive total. A case mismatch misses
            the cache key. A checker that only compared the two numbers was enough. The leak test
            fails if scoring is handed the planted labels, so this catch rate cannot come from
            reading the answer key.
          </p>
        </StoryBeat>

        <section className="story-beat" id="stack">
          <p className="story-kicker">How it works</p>
          <h2>The tools, in plain terms</h2>
          <p className="stack-intro">
            Small Python, a history table, a latest-value cache, and this page. Kafka is optional and
            I skipped it. There is no HTTP API. The page reads data.ts.
          </p>
          <StackGrid />
        </section>

        <StoryBeat
          id="decisions"
          kicker="Design choices"
          title="Parity is the headline"
          caption="What I first reached for, and what I built instead."
          visual={
            <div className="teach-card">
              <h3 className="teach-card__title">First idea, and what I built</h3>
              <table className="choice-table">
                <caption className="sr-only">Design choices</caption>
                <thead>
                  <tr>
                    <th scope="col">First idea</th>
                    <th scope="col">What I built</th>
                  </tr>
                </thead>
                <tbody>
                  {DECISIONS.map((d) => (
                    <tr key={d.first}>
                      <td>{d.first}</td>
                      <td>{d.built}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        >
          <p>
            I did not rebuild a feature platform. The point is a loud check when Redis and Postgres
            disagree. Same transform on both sides. Cap of 5,000 accounts, fixed seed.
          </p>
          <p>
            Docker was not running, so sqlite and a dict stand in for Postgres and Redis. The table
            columns and the cache keys match DESIGN. Compose still names postgres and redis for when
            the daemon is up.
          </p>
        </StoryBeat>

        <section className="story-beat" id="use">
          <p className="story-kicker">What is next, and who feels this</p>
          <h2>Run it, then the gaps</h2>
          <p style={{ maxWidth: 'var(--measure)' }}>
            Compose up is optional while Docker is down. The planted eval still runs in process.
          </p>
          <ol className="stack-list" style={{ maxWidth: 'var(--measure)' }}>
            <li>
              <code>python -m pytest tests/test_eval.py -q</code>
            </li>
            <li>
              <code>python scripts/run.py</code> prints detector vs naive baseline and writes{' '}
              <code>metrics.json</code>
            </li>
            <li>
              <code>npm --prefix web run build</code>
            </li>
          </ol>
          <ul className="stack-list" style={{ maxWidth: 'var(--measure)', marginTop: 'var(--space-4)' }}>
            {NEXT.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <ul className="sector-list" style={{ maxWidth: 'var(--measure)', marginTop: 'var(--space-5)' }}>
            {SECTORS.map((s) => (
              <li key={s.name}>
                <strong>{s.name}</strong>
                {s.job}
              </li>
            ))}
          </ul>
        </section>

        <footer
          id="close"
          style={{
            borderTop: '1px solid var(--line-rule)',
            paddingTop: 'var(--space-6)',
            marginTop: 'var(--space-6)',
            color: 'var(--fg-low)',
            fontSize: 'var(--fs-sm)',
          }}
        >
          <p style={{ maxWidth: 'var(--measure)' }}>
            I want a loud check when Redis and Postgres disagree. I do not need a new platform
            brand. Planted spends, seed {METRICS.seed}, {METRICS.nEntities.toLocaleString()} accounts.
            Store this run: {METRICS.store}.
          </p>
        </footer>
      </main>
    </>
  )
}

const PROBLEM_CAPTION =
  'One account, 24 hourly spends. Postgres sums all 24. Redis drops the oldest hour, which is the window bug.'
