export class TodoList {
    constructor() {
        this.tasks = [];
    }

    addTask(title) {
        this.tasks.push({ title, completed: false });
    }

    completeTask(index) {
        if (this.tasks[index]) {
            this.tasks[index].completed = true;
        }
    }

    listTasks() {
        this.tasks.forEach((task, index) => {
            const status = task.completed ? '✔ Done' : '✘ Pending';
            console.log(`${index + 1}. ${task.title} - ${status}`);
        });
    }
}