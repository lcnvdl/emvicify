const { expect } = require("chai");
const { start } = require("../src/system/application");

describe("Application", () => {
    describe("start", () => {
        it("should work fine", async () => {
            const { engines } = await start(__dirname, 1234, { textMode: true });
            engines.expressEngine.close();
        });
    });
});