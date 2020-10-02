const ExpressRouter = require("./express-router");

/** @deprecated Use express-router instead of base-router. */
class BaseRouter extends ExpressRouter {
    constructor(p) {
        super(p);
        console.warn("Deprecated: use express-router instead of base-router.");
    }
}

module.exports = BaseRouter;