const RequestModel = require("./request-model");

class ResponseModel extends RequestModel {
    /**
     * @param {string} id Id
     * @param {string} url Url
     * @param {any} [data] Data
     * @param {any} [headers] Headers
     * @param {number} [statusCode] Status code
     */
    constructor(id, url, data, headers, statusCode) {
        super(id, url, data, headers);
        this.statusCode = statusCode || 200;
    }

    static parse(str) {
        const { id, url, data, headers, statusCode } = JSON.parse(str);
        return new ResponseModel(id, url, data, headers, statusCode);
    }
}

module.exports = ResponseModel;
