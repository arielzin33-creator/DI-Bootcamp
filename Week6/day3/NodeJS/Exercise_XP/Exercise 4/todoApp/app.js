import { TodoList } from './todo.js';

const myTodoList = new TodoList();

myTodoList.addTask('Buy groceries');
myTodoList.addTask('Clean the house');

myTodoList.completeTask(0);
myTodoList.completeTask(1);

myTodoList.listTasks();