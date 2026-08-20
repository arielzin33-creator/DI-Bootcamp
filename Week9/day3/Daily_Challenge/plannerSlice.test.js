import { describe, it, expect } from 'vitest';
import plannerReducer, { dateSelected, addTask, editTask, deleteTask } from './plannerSlice';

const emptyState = { tasksByDate: {}, selectedDate: '2024-03-15' };

describe('dateSelected', () => {
  it('changes the selected date', () => {
    const state = plannerReducer(emptyState, dateSelected('2024-03-20'));
    expect(state.selectedDate).toBe('2024-03-20');
  });
});

describe('addTask', () => {
  it('creates the date entry if it does not exist yet', () => {
    const state = plannerReducer(emptyState, addTask('2024-03-15', 'Buy groceries'));
    expect(state.tasksByDate['2024-03-15']).toHaveLength(1);
    expect(state.tasksByDate['2024-03-15'][0]).toMatchObject({ text: 'Buy groceries' });
    expect(typeof state.tasksByDate['2024-03-15'][0].id).toBe('string');
  });

  it('keeps tasks on different days independent of each other', () => {
    let state = plannerReducer(emptyState, addTask('2024-03-15', 'Task for the 15th'));
    state = plannerReducer(state, addTask('2024-03-16', 'Task for the 16th'));

    expect(state.tasksByDate['2024-03-15']).toHaveLength(1);
    expect(state.tasksByDate['2024-03-16']).toHaveLength(1);
    expect(state.tasksByDate['2024-03-15'][0].text).toBe('Task for the 15th');
    expect(state.tasksByDate['2024-03-16'][0].text).toBe('Task for the 16th');
  });
});

describe('editTask', () => {
  it('updates only the matching task on the matching day', () => {
    let state = plannerReducer(emptyState, addTask('2024-03-15', 'Original'));
    const id = state.tasksByDate['2024-03-15'][0].id;

    state = plannerReducer(state, editTask({ date: '2024-03-15', id, text: 'Updated' }));
    expect(state.tasksByDate['2024-03-15'][0].text).toBe('Updated');
  });

  it('does nothing if the date has no tasks at all', () => {
    const state = plannerReducer(emptyState, editTask({ date: '2024-03-15', id: 'x', text: 'y' }));
    expect(state).toEqual(emptyState);
  });
});

describe('deleteTask', () => {
  it('removes only the matching task, leaving other days untouched', () => {
    let state = plannerReducer(emptyState, addTask('2024-03-15', 'A'));
    state = plannerReducer(state, addTask('2024-03-15', 'B'));
    state = plannerReducer(state, addTask('2024-03-16', 'C'));
    const idA = state.tasksByDate['2024-03-15'][0].id;

    state = plannerReducer(state, deleteTask({ date: '2024-03-15', id: idA }));

    expect(state.tasksByDate['2024-03-15']).toHaveLength(1);
    expect(state.tasksByDate['2024-03-15'][0].text).toBe('B');
    expect(state.tasksByDate['2024-03-16']).toHaveLength(1);
  });
});
