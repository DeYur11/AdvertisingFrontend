import { Handler } from "./Handler";

export class ServiceNameMatchHandler extends Handler {
    constructor(searchQuery, next) {
        super(next);
        this.searchQuery = (searchQuery ?? "").trim().toLowerCase();
    }

    handle(project) {
        const projectMatchesSearch = project.__projectMatchesSearch;

        const filteredServices = Object.values(project.services)
            .map(service => {
                const serviceMatches = service.serviceName.toLowerCase().includes(this.searchQuery);
                const matchedTasks = service.tasks.filter(task =>
                    task.name.toLowerCase().includes(this.searchQuery)
                );

                if (projectMatchesSearch) {
                    // Якщо проект співпав — беремо сервіс повністю
                    return {
                        ...service,
                        filteredTasks: service.tasks
                    };
                }

                if (serviceMatches) {
                    // Якщо співпав сервіс — беремо сервіс повністю
                    return {
                        ...service,
                        filteredTasks: service.tasks
                    };
                }

                if (matchedTasks.length > 0) {
                    // Якщо співпали завдання — беремо тільки matched завдання
                    return {
                        ...service,
                        filteredTasks: matchedTasks
                    };
                }

                return null;
            })
            .filter(service => service !== null);

        // Якщо ні проект, ні сервіси не співпали
        if (filteredServices.length === 0 && !projectMatchesSearch) {
            return null;
        }

        return {
            ...project,
            services: filteredServices.length > 0 ? filteredServices : Object.values(project.services)
        };
    }
}