const { expect } = require("chai");
const ExpressEngine = require("../src/system/engines/express-engine");

describe("Express Engine", () => {
    describe("constructor", () => {
        it("should work fine", () => {
            const engine = new ExpressEngine();
            expect(engine).to.be.ok;
        });
    });

    describe("prepare", () => {
        it("should work fine", () => {
            const engine = new ExpressEngine();
            engine.prepare();
        });
    });
});