/** @typedef {import("../../system/engines/express-engine")} ExpressEngine */

const AbstractRouter = require("./abstract-router");

/**
 * Router for Express JS.
 */
class ExpressRouter extends AbstractRouter {
    constructor(objects) {
        super(objects);

        this.app = null;
        /** @type {ExpressEngine} */
        this.engine = null;
    }

    registerEngines({ expressEngine }) {
        if (!expressEngine) {
            return;
        }

        this.engine = expressEngine;
        this.app = expressEngine.app;
    }

    _parseUrl(url) {
        let finalUrl;
        if (url === "" || (url && url[0] !== "/")) {
            finalUrl = this.baseUrl + url;
        }
        else {
            finalUrl = url;
        }
        return finalUrl;
    }

    _callAction(url, method, action, middlewares, app) {
        app = app || this.app;

        url = this._parseUrl(url);

        if (!middlewares) {
            app[method](url, (req, res) => {
                let result = action(req, res);
                this.processResult(req, res, result);
            });
        }
        else {
            app[method](url, middlewares, (req, res) => {
                let result = action(req, res);
                this.processResult(req, res, result);
            });
        }
    }

    post(url, action, middlewares, app) {
        this._callAction(url, "post", action, middlewares, app);
    }

    get(url, action, middlewares, app) {
        this._callAction(url, "get", action, middlewares, app);
    }

    delete(url, action, middlewares, app) {
        this._callAction(url, "delete", action, middlewares, app);
    }

    put(url, action, middlewares, app) {
        this._callAction(url, "put", action, middlewares, app);
    }

    processResult(req, res, result) {
        let emptyResult = this.routerSettings.emptyResult;
        if (typeof emptyResult === "undefined") {
            emptyResult = {};
        }

        if (result instanceof Promise) {
            result.then(obj => {
                if (!res.finished) {
                    if (typeof obj === "undefined") {
                        res.json(emptyResult);
                    }
                    else {
                        res.json(obj);
                    }
                }
            }, err => {
                this.handleError(req, res, err);
            });
        }
        else if (!res.finished) {
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

        if (typeof error === "string") {
            res.status(500).json({ message: error, stack: null });
        }
        else if (error instanceof Error) {
            res.status(500).json({ message: error.message, stack: error.stack });
        }
        else {
            res.status(500).json({ error });
        }
    }
}

module.exports = ExpressRouter;