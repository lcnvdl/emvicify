const { expect } = require("chai");
const JsonArgsEngine = require("../src/system/engines/json-args-engine");

const settings = { };

/** @type {JsonArgsEngine} */
let engine = null;

describe("Json Args Engine", () => {
    beforeEach(() => {
        engine = new JsonArgsEngine({ channel: "testing" }, settings);
    });

    describe("prepare", () => {
        it("should work fine", () => {
            engine.prepare();
        });
    });

});