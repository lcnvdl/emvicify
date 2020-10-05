class RequestModel {
    /**
     * @param {string} id Id
     * @param {string} url Url
     * @param {any} [datos] Datos
     * @param {any} [headers] Headers
     */
    constructor(id, url, datos, headers) {
        this.id = id;
        this.url = url;
        this.datos = datos || {};
        this.headers = headers || {};
    }

    addHeader(key, value) {
        this.headers[key] = value;
        return this;
    }

    toString() {
        return JSON.stringify(this);
    }
}

module.exports = RequestModel;
