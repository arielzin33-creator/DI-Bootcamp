import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dateSelected } from '../features/planner/plannerSlice';
import { selectSelectedDate, selectDatesWithTasks } from '../features/planner/selectors';
import {
  getMonthGrid,
  formatMonthLabel,
  toDateKey,
  todayKey,
  WEEKDAY_LABELS,
} from '../features/planner/dateUtils';

export default function Calendar() {
  const dispatch = useDispatch();
  const selectedDate = useSelector(selectSelectedDate);
  const datesWithTasks = useSelector(selectDatesWithTasks);

  const [selectedYear, selectedMonth] = selectedDate.split('-').map(Number);
  // The month currently being *browsed* is its own local state, separate
  // from the selected day in Redux — paging to next month to plan ahead
  // shouldn't change which day's tasks are showing until a day is clicked.
  const [viewDate, setViewDate] = useState({ year: selectedYear, month: selectedMonth - 1 });

  const weeks = getMonthGrid(viewDate.year, viewDate.month);
  const today = todayKey();

  const goToMonth = (delta) => {
    setViewDate(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  return (
    <section className="calendar" aria-label="Calendar">
      <header className="calendar__head">
        <button type="button" className="calendar__nav" onClick={() => goToMonth(-1)} aria-label="Previous month">
          ‹
        </button>
        <span className="calendar__month">{formatMonthLabel(viewDate.year, viewDate.month)}</span>
        <button type="button" className="calendar__nav" onClick={() => goToMonth(1)} aria-label="Next month">
          ›
        </button>
      </header>

      <div className="calendar__weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="calendar__grid">
        {weeks.flat().map(({ date, dateKey, inCurrentMonth }) => {
          const isSelected = dateKey === selectedDate;
          const isToday = dateKey === today;
          const hasTasks = datesWithTasks.has(dateKey);

          return (
            <button
              key={dateKey}
              type="button"
              className={[
                'calendar__day',
                !inCurrentMonth && 'calendar__day--muted',
                isSelected && 'calendar__day--selected',
                isToday && 'calendar__day--today',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => dispatch(dateSelected(dateKey))}
              aria-current={isSelected ? 'date' : undefined}
              aria-label={date.toDateString()}
            >
              {date.getDate()}
              {hasTasks && <span className="calendar__dot" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
