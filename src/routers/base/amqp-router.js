/** @typedef {import("../../system/engines/rabbitmq-engine")} RabbitEngine */
/** @typedef {import("../../system/engines/models/request-model")} RequestModel */

const AbstractRouter = require("./abstract-router");

/**
 * Router for Express JS.
 */
class AmqpRouter extends AbstractRouter {
    constructor(objects) {
        super(objects);

        this.app = null;
        /** @type {RabbitEngine} */
        this.engine = null;
        this.actions = {};
    }

    registerEngines({ amqpEngine }) {
        if (!amqpEngine) {
            return;
        }

        this.engine = amqpEngine;
        this.engine.onReceive((request, callback) => this._process(request, callback));
    }

    /**
     * @param {RequestModel} request Request
     * @param {Function} [callback] 
     */
    async _process(request, callback) {
        const action = this.actions[request.url];
        if (action) {
            const reply = action(request);

            if (reply instanceof Promise) {
                reply = await reply;
            }

            callback(reply);
        }
    }

    registerAction(url, fn) {
        url = this._normalizeUrl(url);

        this.actions[url] = fn;
    }

    post(url, action, middlewares, app) {
        app = app || this.app;

        if (url === "" || (url && url[0] !== "/")) {
            url = this.baseUrl + url;
        }

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

    get(url, action, middlewares, app) {
        app = app || this.app;

        if (url === "" || (url && url[0] !== "/")) {
            url = this.baseUrl + url;
        }

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

    /**
     * @param {string} url 
     */
    _normalizeUrl(url) {
        while (url.startsWith("/")) {
            url = url.substr(1);
        }

        while (url.endsWith("/")) {
            url = url.substr(0, url.length - 1);
        }

        return url.toLowerCase();
    }
}

module.exports = AmqpRouter;
