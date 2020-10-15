const EventEmitter = require('events');
const BaseEngine = require("./base-engine");
const RequestModel = require("../engines/models/request-model");
const ResponseModel = require("../engines//models/response-model");

class ProcessAsServiceEngine extends BaseEngine {
    constructor(source, settings) {
        super();
        this.source = source;
        this.settings = settings || {};
        this.events = new EventEmitter();
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

    /**
     * @abstract
     * @returns {*} Json
     */
    _readInputAsJson() {
        throw new Error("Abstract method");
    }

    /**
     * @virtual
     * @param {ResponseModel} response Response
     */
    _returnResponseAndExit(response) {
        if (this.settings.testMode) {
            return response;
        }
        else {
            process.exit(response.statusCode >= 400 ? 1 : 0);
        }
    }

    async serveNow() {
        let reply = null;
        try {
            const inputPackage = this._readInputAsJson();
            reply = await this._processMessage(inputPackage.content, inputPackage.properties);
        }
        catch (err) {
            reply = new ResponseModel("", "", err.message || ("" + err), {}, 500);
        }
        finally {
            return this._returnResponseAndExit(reply);
        }
    }

    async serve() {
        setTimeout(() => this.serveNow(), 1);
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
}

module.exports = ProcessAsServiceEngine;
