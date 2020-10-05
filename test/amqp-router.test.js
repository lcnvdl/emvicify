const { expect } = require("chai");
const AmqpRouter = require("../src/routers/base/amqp-router");
const RequestModel = require("../src/system/engines/models/request-model");

const settings = {};
const controllers = {};
const middlewares = {};
const routerSettings = {};

/** @type {AmqpRouter} */
let router;

describe("AmqpRouter", () => {
    beforeEach(() => {
        router = new AmqpRouter({ settings, controllers, middlewares, routerSettings });
    });

    describe("constructor", () => {
        it("should work fine", () => {
            expect(router).to.be.ok;
        });
    });

    describe("registerAction", () => {
        it("should process a simple request", (done) => {
            let executed = false;
            router.registerAction("hola/Chau", (r) => {
                console.log(r);
                executed = r.data.executed;
            });

            const request = new RequestModel("r1", "hola/chau", { executed: true });

            router._process(request, () => {
                expect(executed).to.be.true;
                done();
            });
        });
    });
});
