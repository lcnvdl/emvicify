const { expect } = require("chai");
const JsonArgsRouter = require("../src/routers/base/json-args-router");

const settings = { settings: {}, routerSettings: {} };

/** @type {JsonArgsRouter} */
let router = null;

describe("Json Args Router", () => {
    beforeEach(() => {
        router = new JsonArgsRouter(settings);
    });

    describe("constructor", () => {
        it("should work fine", () => {
            expect(router).to.be.ok;
        });
    })
});