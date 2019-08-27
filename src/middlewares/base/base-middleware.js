class BaseMiddleware {
    constructor({ services }) {
        this.services = services;
    }

    generate(_options) {
        throw new Error("Abstract method");
    }
}

module.exports = BaseMiddleware;