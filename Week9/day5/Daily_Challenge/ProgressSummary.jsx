import { useSelector } from 'react-redux';
import { selectTaskStats } from '../features/tasks/selectors';

export default function ProgressSummary() {
  const { total, completed, remaining } = useSelector(selectTaskStats);
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section className="summary" aria-label="Overall progress">
      <div className="summary__figure">
        <span className="summary__pct">{pct}%</span>
        <span className="summary__pct-label">complete</span>
      </div>
      <dl className="summary__stats">
        <div>
          <dt>Logged</dt>
          <dd>{total}</dd>
        </div>
        <div>
          <dt>Done</dt>
          <dd>{completed}</dd>
        </div>
        <div>
          <dt>Open</dt>
          <dd>{remaining}</dd>
        </div>
      </dl>
    </section>
  );
}
