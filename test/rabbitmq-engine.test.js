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

    describe("url", () => {
        it("empty url", () => {
            const engine = new RabbitMQEngine({}, {});
            expect(engine.url).to.equals("amqp://localhost");
        });

        it("with user and pass and protocol", () => {
            const engine = new RabbitMQEngine({}, { protocol: "amqps", user: "user", password: "pass" });
            expect(engine.url).to.equals("amqps://user:pass@localhost");
        });

        it("with user and pass", () => {
            const engine = new RabbitMQEngine({}, { user: "user", password: "pass" });
            expect(engine.url).to.equals("amqp://user:pass@localhost");
        });

        it("with user and pass and port", () => {
            const engine = new RabbitMQEngine({}, { user: "user", password: "pass", port: 1234 });
            expect(engine.url).to.equals("amqp://user:pass@localhost:1234");
        });

        it("with user and pass and port and host", () => {
            const engine = new RabbitMQEngine({}, { user: "user", password: "pass", port: 1234, host: "127.0.0.1" });
            expect(engine.url).to.equals("amqp://user:pass@127.0.0.1:1234");
        });

        it("with user and pass and port and host and vhost", () => {
            const engine = new RabbitMQEngine({}, { user: "user", password: "pass", port: 1234, host: "127.0.0.1", vhost: "testing" });
            expect(engine.url).to.equals("amqp://user:pass@127.0.0.1:1234/testing");
        });
    });
});