class AbstractRouter {
    constructor({ settings, controllers, middlewares, routerSettings }) {
        this.controllers = controllers;
        this.middlewares = middlewares;
        this.routerSettings = routerSettings;

        if (settings && settings.baseUrl) {
            this.baseUrl = settings.baseUrl;
        }
        else {
            this.baseUrl = "/";
        }
    }

    registerActions() {
        throw new Error("Abstract method");
    }
}

module.exports = AbstractRouter;