import { useDispatch, useSelector } from 'react-redux'
import { selectDay } from '../features/planner/plannerSlice'
import { shiftDate, todayISO } from '../utils/date'

function formatDisplayDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function Calendar() {
  const dispatch = useDispatch()
  const selectedDate = useSelector((state) => state.planner.selectedDate)

  const goToToday = () => {
    dispatch(selectDay(todayISO()))
  }

  return (
    <div className="calendar">
      <div className="calendar-nav">
        <button type="button" onClick={() => dispatch(selectDay(shiftDate(selectedDate, -1)))}>
          ← Prev
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => dispatch(selectDay(e.target.value))}
        />
        <button type="button" onClick={() => dispatch(selectDay(shiftDate(selectedDate, 1)))}>
          Next →
        </button>
      </div>
      <div className="calendar-summary">
        <span>{formatDisplayDate(selectedDate)}</span>
        <button type="button" className="today-button" onClick={goToToday}>
          Today
        </button>
      </div>
    </div>
  )
}

export default Calendar
