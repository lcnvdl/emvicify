class BaseMiddleware {
    constructor({ services }) {
        this.services = services;
    }

    /**
     * @abstract
     * @param {*} _options Options
     */
    generate(_options) {
        throw new Error("Abstract method");
    }
}

module.exports = BaseMiddleware;