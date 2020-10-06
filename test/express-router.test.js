const { expect } = require("chai");
const ExpressRouter = require("../src/routers/base/express-router");

const settings = {};
const controllers = {};
const middlewares = {};
const routerSettings = {};

const expressEngine = {
    app: {
        get: function () {
        }
    }
};

/** @type {ExpressRouter} */
let router;

class ExpressRouterStub extends ExpressRouter {
    registerActions() {
    }
}

describe("ExpressRouter", () => {
    beforeEach(() => {
        router = new ExpressRouterStub({ settings, controllers, middlewares, routerSettings });
        router.register({ expressEngine });
    });

    describe("constructor", () => {
        it("should work fine", () => {
            expect(router).to.be.ok;
        });
    });
});
