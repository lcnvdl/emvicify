const path = require("path");
const { expect } = require("chai");
const JsonFSEngine = require("../src/system/engines/json-fs-engine");
const RequestModel = require("../src/system/engines/models/request-model");

const originalFileSystem = {};
originalFileSystem[path.normalize("/home/testing/input.json")] = {
    encoding: "utf8",
    content: JSON.stringify({
        content: (new RequestModel("", "get-user", { "id": 1 }, {}).toString()),
        properties: {}
    })
};

let fileSystem = JSON.parse(JSON.stringify(originalFileSystem));

const fs = {
    writeFileSync(f, content, encoding) {
        fileSystem[path.normalize(f)] = { content, encoding };
    },

    readFileSync(f, encoding) {
        f = path.normalize(f);

        if (!fileSystem[f]) {
            throw new Error(`File doesn't exists: ${f}`);
        }

        return fileSystem[f].content;
    },

    existsSync(f) {
        return !!fileSystem[path.normalize(f)];
    },

    unlinkSync(f) {
        delete fileSystem[path.normalize(f)];
    }
};

const settings = { fs, testMode: true, cwd: "/home" };

/** @type {JsonFSEngine} */
let engine = null;

describe("JsonFS Engine", () => {
    beforeEach(() => {
        engine = new JsonFSEngine({ channel: "testing" }, settings);
        fileSystem = JSON.parse(JSON.stringify(originalFileSystem));
    });

    describe("prepare", () => {
        it("should work fine", () => {
            engine.prepare();
        });
    });

    describe("serve", () => {
        it("should work fine", async () => {
            engine.prepare();

            expect(fs.existsSync("/home/testing/input.json")).to.be.true;
            expect(fs.existsSync("/home/testing/reply.json")).to.be.false;

            const reply = await engine.serveNow();
            expect(reply).to.be.ok;
            expect(reply.statusCode).to.equals(200, reply.data);

            expect(fs.existsSync("/home/testing/input.json")).to.be.false;
            expect(fs.existsSync("/home/testing/reply.json")).to.be.true;
        });
    });
});