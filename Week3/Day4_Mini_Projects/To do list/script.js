/**
 * script.js — To-Do List
 *
 * Covers:
 *  - Required: addTask(), empty-check, push to array, inject into DOM
 *  - Bonus I : task objects with task_id / text / done,
 *              data-task-id attributes, doneTask()
 */

'use strict';

/* ══════════════════════════════════════════════════════
   1. DATA
   ══════════════════════════════════════════════════════ */

// BONUS I — array of task objects instead of plain strings
const tasks = [];
// Each object shape: { task_id: Number, text: String, done: Boolean }

/* ══════════════════════════════════════════════════════
   2. DOM REFERENCES
   ══════════════════════════════════════════════════════ */

const form       = document.getElementById('task-form');
const taskInput  = document.getElementById('task-input');
const listTasks  = document.querySelector('.listTasks');

/* ══════════════════════════════════════════════════════
   3. addTask()
   ══════════════════════════════════════════════════════ */

/**
 * Called when the user clicks "Submit".
 * 1. Checks the input is not empty.
 * 2. Creates a task object and pushes it to the array.
 * 3. Renders the task in the DOM.
 */
function addTask() {
  const text = taskInput.value.trim();

  // ── Check input is not empty ──────────────────────────
  if (text === '') {
    taskInput.focus();
    return;
  }

  // ── Build task object (Bonus I) ───────────────────────
  const taskObj = {
    task_id: tasks.length,   // starts from 0, increments naturally
    text:    text,
    done:    false           // false by default
  };

  // ── Push to array ─────────────────────────────────────
  tasks.push(taskObj);

  // ── Add to the DOM ────────────────────────────────────
  renderTask(taskObj);

  // ── Reset input ───────────────────────────────────────
  taskInput.value = '';
  taskInput.focus();

  // Remove empty-state message if present
  const emptyMsg = listTasks.querySelector('.empty-msg');
  if (emptyMsg) emptyMsg.remove();
}

/* ══════════════════════════════════════════════════════
   4. renderTask()  — builds one task row in the DOM
   ══════════════════════════════════════════════════════ */

/**
 * Creates the DOM element for a task and appends it to .listTasks.
 * Left-to-right order: [X button] [checkbox] [label text]
 *
 * @param {{ task_id: number, text: string, done: boolean }} taskObj
 */
function renderTask(taskObj) {
  // ── Wrapper div ────────────────────────────────────────
  const item = document.createElement('div');
  item.className = 'task-item';
  // BONUS I: data-task-id attribute matches task_id
  item.setAttribute('data-task-id', taskObj.task_id);

  // ── X (delete) button — Font Awesome icon ──────────────
  const btnDelete = document.createElement('button');
  btnDelete.className = 'btn-delete';
  btnDelete.setAttribute('aria-label', 'Delete task');
  btnDelete.innerHTML = '<i class="fa-solid fa-xmark"></i>';

  btnDelete.addEventListener('click', function () {
    deleteTask(taskObj.task_id, item);
  });

  // ── Checkbox ───────────────────────────────────────────
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id   = 'task-cb-' + taskObj.task_id;
  checkbox.checked = taskObj.done;

  // BONUS I: clicking checkbox calls doneTask()
  checkbox.addEventListener('change', function () {
    doneTask(taskObj.task_id, item, checkbox);
  });

  // ── Label (task text) ──────────────────────────────────
  const label = document.createElement('label');
  label.className = 'task-label';
  label.htmlFor   = 'task-cb-' + taskObj.task_id;
  label.textContent = taskObj.text;

  // ── Assemble: X → checkbox → label ────────────────────
  item.appendChild(btnDelete);
  item.appendChild(checkbox);
  item.appendChild(label);

  listTasks.appendChild(item);
}

/* ══════════════════════════════════════════════════════
   5. doneTask()  — BONUS I
   ══════════════════════════════════════════════════════ */

/**
 * Toggles the done state of a task:
 *  - Flips taskObj.done in the array
 *  - Adds/removes the "done" CSS class (crossed out red in CSS)
 *
 * @param {number} id        - task_id to find in the array
 * @param {Element} item     - the .task-item DOM element
 * @param {HTMLInputElement} checkbox
 */
function doneTask(id, item, checkbox) {
  // Find the object in the array by task_id
  const taskObj = tasks.find(function (t) { return t.task_id === id; });
  if (!taskObj) return;

  // Flip the boolean in the data model
  taskObj.done = checkbox.checked;

  // Reflect in the DOM — CSS handles the crossed-out red style
  item.classList.toggle('done', taskObj.done);
}

/* ══════════════════════════════════════════════════════
   6. deleteTask()
   ══════════════════════════════════════════════════════ */

/**
 * Removes a task from the array and from the DOM.
 *
 * @param {number}  id   - task_id
 * @param {Element} item - the .task-item DOM element
 */
function deleteTask(id, item) {
  // Remove from array
  const index = tasks.findIndex(function (t) { return t.task_id === id; });
  if (index !== -1) tasks.splice(index, 1);

  // Remove from DOM
  item.remove();

  // Show empty-state message if no tasks remain
  if (listTasks.children.length === 0) {
    showEmptyMsg();
  }
}

/* ══════════════════════════════════════════════════════
   7. HELPERS
   ══════════════════════════════════════════════════════ */

function showEmptyMsg() {
  const p = document.createElement('p');
  p.className = 'empty-msg';
  p.textContent = 'No tasks yet. Add one above!';
  listTasks.appendChild(p);
}

/* ══════════════════════════════════════════════════════
   8. EVENT LISTENERS
   ══════════════════════════════════════════════════════ */

// Form submit triggers addTask()
form.addEventListener('submit', function (e) {
  e.preventDefault(); // stop page reload
  addTask();
});

/* ══════════════════════════════════════════════════════
   9. INIT
   ══════════════════════════════════════════════════════ */

showEmptyMsg();
