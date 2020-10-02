class AbstractRouter {
    constructor({ settings, controllers, middlewares, routerSettings }) {
        this.baseUrl = "/";
    }

    registerActions() {
        throw new Error("Abstract method");
    }
}

module.exports = AbstractRouter;