class BaseRouter {
    constructor({ settings, controllers, middlewares, routerSettings }) {
        this.middlewares = middlewares;
        this.controllers = controllers;
        this.settings = settings;
        this.routerSettings = routerSettings || {};
    }

    register(_app) {
        throw new Error("Abstract method");
    }

    post(app, url, action, middlewares) {
        if (!middlewares) {
            app.post(url, (req, res) => {
                let result = action(req, res);
                this.processResult(req, res, result);
            });
        }
        else {
            app.post(url, middlewares, (req, res) => {
                let result = action(req, res);
                this.processResult(req, res, result);
            });
        }
    }

    get(app, url, action, middlewares) {
        if (!middlewares) {
            app.get(url, (req, res) => {
                let result = action(req, res);
                this.processResult(req, res, result);
            });
        }
        else {
            app.get(url, middlewares, (req, res) => {
                let result = action(req, res);
                this.processResult(req, res, result);
            });
        }
    }

    processResult(req, res, result) {
        let emptyResult = this.routerSettings.emptyResult;
        if (typeof emptyResult === "undefined") {
            emptyResult = {};
        }

        if (result instanceof Promise) {
            result.then(obj => {
                if (typeof obj === "undefined") {
                    res.json(emptyResult);
                }
                else {
                    res.json(obj);
                }
            }, err => {
                this.handleError(req, res, err);
            });
        }
        else {
            if (typeof result === "undefined") {
                res.json(emptyResult);
            }
            else {
                res.json(result);
            }
        }
    }

    handleError(_req, res, error) {
        if (this.routerSettings.printHandledErrors) {
            console.error(error);
        }

        if (error instanceof Error) {
            res.status(500).json({ error: { message: error.message, stack: error.stack } });
        }
        else {
            res.status(500).json({ error });
        }
    }
}

module.exports = BaseRouter;