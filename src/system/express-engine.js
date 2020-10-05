const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const BaseEngine = require("./base/base-engine");

class ExpressEngine extends BaseEngine {
    constructor(expressApp, port, expressSettings) {
        super();
        this.app = expressApp || express();
        this.port = port;
        this.expressSettings = expressSettings || {};
        this.server = require("http").Server(this.app);
    }

    get identifier() {
        return "expressEngine";
    }

    prepare() {
        if (this.expressSettings.cors) {
            this.app.use(cors());
        }

        if (this.expressSettings.json || this.expressSettings.bodyParserJson) {
            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({ extended: true }));
        }

        if (this.expressSettings.bodyParserJson) {
            let options = (typeof this.expressSettings.bodyParserJson !== "object") ? null : this.expressSettings.bodyParserJson;
            this.app.use(bodyParser.json(options));
        }

        if (this.expressSettings.bodyParserUrlencoded) {
            let options = (typeof this.expressSettings.bodyParserUrlencoded !== "object") ? { extended: true } : this.expressSettings.bodyParserUrlencoded;
            this.app.use(bodyParser.urlencoded(options));
        }

        if (this.expressSettings.bodyParserRaw) {
            let options = (typeof this.expressSettings.bodyParserRaw !== "object") ? null : this.expressSettings.bodyParserUrlencoded;
            this.app.use(bodyParser.raw(options));
        }
    }

    serve() {
        return new Promise((resolve, reject) => {
            try {
                this.server.listen(this.port, () => {
                    resolve();
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }

    close() {
        this.server.close();
    }
}

module.exports = ExpressEngine;
