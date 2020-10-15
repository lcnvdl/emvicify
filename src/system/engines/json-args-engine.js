const ProcessAsServiceEngine = require("../base/process-as-service-engine");

class JsonArgsEngine extends ProcessAsServiceEngine {
    constructor(source, settings) {
        super(source, settings);
    }

    get identifier() {
        return "jsonArgsEngine";
    }

    prepare() {
    }

    async send() {
    }

    close() {
    }

    /**
     * @param {string[]} [optionalArgs] Optional args
     */
    _readInputAsJson(optionalArgs) {
        const args = optionalArgs || process.argv.slice(2);
        const index = args.indexOf("--json-data");
        if (index === -1) {
            throw new Error("Invalid input");
        }

        return JSON.parse(Buffer.from(args[index + 1], "base64").toString("utf8"));
    }

    _returnResponseAndExit(response) {
        try {
            const json = response.toString();
            const b64 = Buffer.from(json).toString("base64");
            console.log("Response: " + b64);
        }
        finally {
            super._returnResponseAndExit(response);
        }
    }
}

module.exports = JsonArgsEngine;
