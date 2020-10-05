const BaseService = require("./base/base-service");

class AuthService extends BaseService {
    /**
     * @abstract
     * @param {*} dataForValidation Data for validation
     * @param {string} token Token
     * @param {*} roles Roles
     * @returns {Promise<string>}
     */
    validatePackage(dataForValidation, token, roles) {
        //  Should return a promise with the user ID
        return Promise.reject("Not implemented");
    }
}

module.exports = AuthService;