class AbstractRouter {
    constructor({ settings, controllers, middlewares, routerSettings }) {
        this.controllers = controllers;
        this.middlewares = middlewares;
        this.routerSettings = routerSettings || {};
        this.settings = settings;

        if (settings && settings.baseUrl) {
            this.baseUrl = settings.baseUrl;
        }
        else {
            this.baseUrl = "/";
        }

        if (this.baseUrl && this.baseUrl.length > 0 && this.baseUrl[this.baseUrl.length - 1] !== "/") {
            this.baseUrl += "/";
        }
    }

    register(engines) {
        this.registerEngines(engines);
        this.registerActions();
    }

    /**
     * @virtual
     */
    registerEngines(engines) {
    }

    /**
     * @abstract
     */
    registerActions() {
        throw new Error("Abstract method");
    }
}

module.exports = AbstractRouter;