const { expect } = require("chai");
const RabbitMQEngine = require("../src/system/engines/rabbitmq-engine");

describe("RabbitMQ Engine", () => {
    describe("constructor", () => {
        it("should work fine", () => {
            const engine = new RabbitMQEngine();
            expect(engine).to.be.ok;
        });
    });

    describe("prepare", () => {
        it("should work fine", () => {
            const engine = new RabbitMQEngine();
            engine.prepare();
        });
    });
});