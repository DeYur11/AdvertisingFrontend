import { Handler } from "./Handler";

export class ActiveServiceExistenceHandler extends Handler {
    constructor(searchQuery, next) {
        super(next);
        this.searchQuery = (searchQuery ?? "").trim().toLowerCase();
    }

    handle(project) {
        const projectMatchesSearch = project.__projectMatchesSearch;

        // 1. Спочатку перевіряємо чи проект має хоч одне активне завдання
        const hasActiveTasksInProject = Object.values(project.services).some(service =>
            service.tasks.some(task => {
                const status = task.taskStatus.name.toLowerCase();
                return status === "in progress" || status === "pending";
            })
        );

        if (!hasActiveTasksInProject) {
            return null; // проект без активних завдань не показуємо
        }

        // 2. Тепер перевіряємо сервіси
        const filteredServices = Object.values(project.services)
            .map(service => {
                const activeTasks = service.tasks.filter(task => {
                    const status = task.taskStatus.name.toLowerCase();
                    return status === "in progress" || status === "pending";
                });

                if (activeTasks.length === 0) return null; // сервіс без активних завдань не потрібен

                const serviceMatchesSearch = service.serviceName.toLowerCase().includes(this.searchQuery);
                const taskMatchesSearch = activeTasks.some(task =>
                    task.name.toLowerCase().includes(this.searchQuery)
                );

                if (projectMatchesSearch) {
                    // якщо проект співпав, беремо всі сервіси з активними завданнями
                    return {
                        ...service,
                        filteredTasks: activeTasks
                    };
                }

                if (serviceMatchesSearch) {
                    // якщо сервіс співпав — беремо всі активні завдання
                    return {
                        ...service,
                        filteredTasks: activeTasks
                    };
                }

                if (taskMatchesSearch) {
                    // якщо співпали завдання — беремо тільки співпавші завдання
                    const matchedTasks = activeTasks.filter(task =>
                        task.name.toLowerCase().includes(this.searchQuery)
                    );

                    return {
                        ...service,
                        filteredTasks: matchedTasks
                    };
                }

                return null; // нічого не співпало
            })
            .filter(service => service !== null);

        if (filteredServices.length === 0) {
            return null; // проект без відповідних сервісів — прибираємо
        }

        return {
            ...project,
            services: filteredServices
        };
    }
}