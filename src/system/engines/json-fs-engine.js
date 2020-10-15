const fs = require("fs");
const path = require("path");
const BaseEngine = require("../base/base-engine");
const EventEmitter = require('events');
const RequestModel = require("./models/request-model");
const ResponseModel = require("./models/response-model");

class JsonFSEngine extends BaseEngine {
    constructor(source, jsonFsSettings) {
        super();
        this.source = source;
        this.settings = jsonFsSettings || {};
        this.events = new EventEmitter();
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

    onReceive(listener) {
        this.events.on("receive", listener);
    }

    /**
     * @param {RequestModel} message 
     * @param {boolean} waitForAnswer 
     * @returns {Promise<any>}
     */
    triggerReceive(message, waitForAnswer) {
        return new Promise((resolve, reject) => {
            this.events.emit("receive", message, (reply, err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(reply);
                }
            });

            if (!waitForAnswer) {
                resolve(null);
            }
            else {
                setTimeout(() => reject("Timeout"), 5000);
            }
        });
    }

    async _processMessage(msg, properties) {
        const request = RequestModel.parse(msg);

        let reply;

        try {
            const data = await this.triggerReceive(request, properties.replyTo);
            reply = new ResponseModel(request.id, request.url, data, {}, 200);
        }
        catch (err) {
            reply = new ResponseModel(request.id, request.url, err, {}, 500);
        }

        return reply;
    }

    async send() {
    }

    async serveNow() {
        let reply = null;
        try {
            const inputPackage = JSON.parse(this.fs.readFileSync(this._inputPath, "utf8"));
            reply = await this._processMessage(inputPackage.content, inputPackage.properties);
        }
        catch (err) {
            reply = new ResponseModel("", "", err.message || ("" + err), {}, 500);
        }
        finally {
            try {
                this.fs.writeFileSync(this._replyPath, JSON.stringify(reply), "utf8");
                this.fs.unlinkSync(this._inputPath);
            }
            finally {
                if (this.settings.testMode) {
                    return reply;
                }
                else {
                    process.exit(reply.statusCode >= 400 ? 1 : 0);
                }
            }
        }
    }

    async serve() {
        setTimeout(() => this.serveNow(), 1);
    }

    close() {
    }
}

module.exports = JsonFSEngine;
