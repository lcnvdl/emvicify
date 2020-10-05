class BaseEngine {
    /**
     * @abstract
     * @returns {string}
     */
    get identifier() {
        throw new Error("Abstract getter");
    }

    /**
     * @virtual
     */
    prepare() {
    }
    /**
     * @abstract
     * @returns {Promise<any>}
     */
    serve() {
        throw new Error("Abstract method");
    }
    /**
     * @virtual
     */
    close() {
    }
}

module.exports = BaseEngine;
