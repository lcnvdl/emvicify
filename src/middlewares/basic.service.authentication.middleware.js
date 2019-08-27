const ServiceAuthenticationMiddleware = require("./service.authentication.middleware");

class BasicAuthenticationMiddleware extends ServiceAuthenticationMiddleware {
    processForService(encodedString) {
        let header = encodedString.split(" ");
        if (header[0] !== "Basic") {
            throw new Error("Invalid authorization header. It must be 'Basic'.")
        }

        let authString = Buffer.from(header[1], "base64").toString().split(":");
        return {
            user: authString[0],
            password: authString[1]
        };
    }
}

module.exports = BasicAuthenticationMiddleware;