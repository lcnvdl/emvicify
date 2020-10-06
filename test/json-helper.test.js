const JsonHelper = require("../src/helpers/json.helper");
const { expect } = require("chai");

describe("JsonHelper", () => {
    describe("toB64", () => {
        it("should work fine", () => {
            const b64 = JsonHelper.toB64({ hi: true });
            expect(b64).to.equals("eyJoaSI6dHJ1ZX0=");
        });
    });

    describe("fromB64", () => {
        it("should work fine", () => {
            const b64 = JsonHelper.fromB64("eyJoaSI6dHJ1ZX0=");
            expect(b64).to.deep.equal({ hi: true });
        });
    });
});