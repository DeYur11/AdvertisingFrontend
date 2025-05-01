export class Handler {
    constructor(next) {
        this.next = next;
    }

    handle(project) {
        if (this.next) {
            return this.next.handle(project);
        }
        return project;
    }
}