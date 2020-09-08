class AbstractRouter {
    constructor({ settings, controllers, middlewares, routerSettings }) {
    }

    registerActions() {
        throw new Error("Abstract method");
    }
}

module.exports = AbstractRouter;