import { describe, it, expect } from 'vitest';
import plannerReducer, { addTask, dateSelected } from './plannerSlice';
import { selectTasksForSelectedDate, selectDatesWithTasks } from './selectors';

const emptyState = { tasksByDate: {}, selectedDate: '2024-03-15' };

describe('selectTasksForSelectedDate', () => {
  it('returns the tasks for whichever date is selected', () => {
    let planner = plannerReducer(emptyState, addTask('2024-03-15', 'Task A'));
    expect(selectTasksForSelectedDate({ planner })).toEqual([
      expect.objectContaining({ text: 'Task A' }),
    ]);
  });

  it('returns an empty array for a date with no tasks, and the same reference on repeated calls', () => {
    const state = { planner: emptyState };
    const first = selectTasksForSelectedDate(state);
    const second = selectTasksForSelectedDate(state);
    expect(first).toEqual([]);
    expect(first).toBe(second);
  });

  it('switches correctly when the selected date changes', () => {
    let planner = plannerReducer(emptyState, addTask('2024-03-15', 'For the 15th'));
    planner = plannerReducer(planner, addTask('2024-03-16', 'For the 16th'));
    planner = plannerReducer(planner, dateSelected('2024-03-16'));

    expect(selectTasksForSelectedDate({ planner })).toEqual([
      expect.objectContaining({ text: 'For the 16th' }),
    ]);
  });
});

describe('selectDatesWithTasks', () => {
  it('includes only dates that actually have at least one task', () => {
    let planner = plannerReducer(emptyState, addTask('2024-03-15', 'Task A'));
    planner = plannerReducer(planner, addTask('2024-03-16', 'Task B'));

    const dates = selectDatesWithTasks({ planner });
    expect(dates.has('2024-03-15')).toBe(true);
    expect(dates.has('2024-03-16')).toBe(true);
    expect(dates.has('2024-03-17')).toBe(false);
  });
});
