import { useSelector } from 'react-redux';
import { selectAge, selectAgeLoading } from '../features/age/selectors';

const MAX_VISIBLE_CANDLES = 12;

export default function AgeDisplay() {
  const age = useSelector(selectAge);
  const loading = useSelector(selectAgeLoading);

  const visibleCandles = Math.min(age, MAX_VISIBLE_CANDLES);
  const overflow = age - visibleCandles;

  return (
    <div className="cake" aria-live="polite">
      <div className="cake__candles" aria-hidden="true">
        {Array.from({ length: visibleCandles }, (_, i) => (
          <span key={i} className="candle">
            <span className="candle__flame" />
            <span className="candle__stick" />
          </span>
        ))}
        {overflow > 0 && <span className="cake__overflow">+{overflow}</span>}
      </div>

      <div className="cake__base">
        <p className="cake__age">
          {loading ? (
            <span className="cake__spinner" role="status" aria-label="Updating age">
              <span className="cake__spinner-flame" />
            </span>
          ) : (
            age
          )}
        </p>
        <p className="cake__label">{loading ? 'updating…' : 'years old'}</p>
      </div>
    </div>
  );
}
