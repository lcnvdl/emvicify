const { expect } = require("chai");
const AmqpRouter = require("../src/routers/base/amqp-router");

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

/** @type {AmqpRouter} */
let router;

class AmqpRouterStub extends AmqpRouter {
    registerActions() {
    }
}

describe("AmqpRouter", () => {
    beforeEach(() => {
        router = new AmqpRouterStub({ settings, controllers, middlewares, routerSettings });
        router.register({ expressEngine });
    });

    describe("constructor", () => {
        it("should work fine", () => {
            expect(router).to.be.ok;
        });
    });
});
