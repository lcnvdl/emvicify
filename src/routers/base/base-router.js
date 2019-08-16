class BaseRouter {
    constructor({ settings, controllers, middlewares }) {
        this.middlewares = middlewares;
        this.controllers = controllers;
        this.settings = settings;
    }

    register(_app) {
        throw new Error("Abstract method");
    }
}

module.exports = BaseRouter;