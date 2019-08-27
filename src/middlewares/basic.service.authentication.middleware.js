const ServiceAuthenticationMiddleware = require("./service.authentication.middleware");

class BasicAuthenticationMiddleware extends ServiceAuthenticationMiddleware {
    processForService(encodedString) {
        let authString = atob(encodedString).split(":");
        return {
            user: authString[0],
            password: authString[1]
        };
    }
}

module.exports = BasicAuthenticationMiddleware;