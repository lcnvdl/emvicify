class BaseMiddleware {
    generate(_options) {
        throw new Error("Abstract method");
    }
}

module.exports = BaseMiddleware;