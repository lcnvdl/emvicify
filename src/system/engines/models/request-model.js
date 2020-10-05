class RequestModel {
    /**
     * @param {string} id Id
     * @param {string} url Url
     * @param {any} [data] Data
     * @param {any} [headers] Headers
     */
    constructor(id, url, data, headers) {
        this.id = id;
        this.url = url;
        this.data = data || {};
        this.headers = headers || {};
    }

    addHeader(key, value) {
        this.headers[key] = value;
        return this;
    }

    toString() {
        return JSON.stringify(this);
    }

    static parse(str) {
        const { id, url, data, headers } = JSON.parse(str);
        return new RequestModel(id, url, data, headers);
    }
}

module.exports = RequestModel;
