const fs = require("fs");
const path = require("path");
const ProcessAsServiceEngine = require("../base/process-as-service-engine");

class JsonFSEngine extends ProcessAsServiceEngine {
    constructor(source, jsonFsSettings) {
        super(source, jsonFsSettings);
        this.fs = this.settings.fs || fs;
    }

    get identifier() {
        return "jsonFsEngine";
    }

    get _cwd() {
        return this.settings.cwd || process.cwd();
    }

    get _inputPath() {
        return path.join(this._cwd, this.source.channel, "input.json");
    }

    get _replyPath() {
        return path.join(this._cwd, this.source.channel, "reply.json");
    }

    prepare() {
    }

    async send() {
    }

    close() {
    }

    _readInputAsJson() {
        return JSON.parse(this.fs.readFileSync(this._inputPath, "utf8"));
    }

    _returnResponseAndExit(response) {
        try {
            this.fs.writeFileSync(this._replyPath, JSON.stringify(response), "utf8");
            this.fs.unlinkSync(this._inputPath);
        }
        finally {
            return super._returnResponseAndExit(response);
        }
    }
}

module.exports = JsonFSEngine;
