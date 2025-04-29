import { Handler } from "./Handler";

export class ProjectNameMatchHandler extends Handler {
    constructor(searchQuery, next) {
        super(next);
        this.searchQuery = searchQuery.trim().toLowerCase();
    }

    handle(project) {
        const matches = project.name.toLowerCase().includes(this.searchQuery);

        project.__projectMatchesSearch = matches; // пам'ятаємо, що проект співпав або ні

        return super.handle(project);
    }
}
