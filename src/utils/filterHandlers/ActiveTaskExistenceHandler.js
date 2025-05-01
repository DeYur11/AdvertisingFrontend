import { Handler } from "./Handler";

export class ActiveTaskExistenceHandler extends Handler {
    handle(project) {
        const hasActiveTasks = Object.values(project.services).some(service =>
            service.tasks.some(task => {
                const status = task.taskStatus.name.toLowerCase();
                return status === "in progress" || status === "pending";
            })
        );

        if (!hasActiveTasks) {
            return null; // Проект відкидаємо
        }

        return super.handle(project);
    }
}