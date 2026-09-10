import { ABLATION } from '../../data'

export function PlantViz() {
  return (
    <div className="teach-card">
      <h3 className="teach-card__title">Three bugs I planted</h3>
      <ul className="split-chips" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
        {ABLATION.map((a) => (
          <li key={a.key} className="chip chip--held" style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
            <span>{a.label}</span>
            <span>{a.n} rows</span>
          </li>
        ))}
      </ul>
      <p className="meta" style={{ margin: '0.75rem 0 0', textTransform: 'none', letterSpacing: 0 }}>
        The rest of the accounts match on purpose. The checker has to find the bad rows without being
        told which they are.
      </p>
    </div>
  )
}
