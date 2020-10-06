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
        try {
            if (action) {
                const reply = action(request);
    
                if (reply instanceof Promise) {
                    reply = await reply;
                }
    
                callback(reply);
            }
        }
        catch(err) {
            this.handleError(err, e => callback(null, e));
        }
    }

    /**
     * @todo Parse middlewares.
     */
    registerAction(url, actionFn, middlewares) {
        url = this._normalizeUrl(url);

        this.actions[url] = actionFn;
    }

    handleError(error, errorCallback) {
        if (this.routerSettings.printHandledErrors) {
            console.error(error);
        }

        errorCallback(error);
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
