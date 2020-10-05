const BaseMiddleware = require("./base/base-middleware");
const JwtAuthenticationMiddleware = require("./jwt.authentication.middleware");
const BasicServiceAuthenticationMiddleware = require("./basic.service.authentication.middleware");
const ServiceAuthenticationMiddleware = require("./service.authentication.middleware");
const AuthMiddleware = require("./auth.middleware");

module.exports = {
    BaseMiddleware,
    JwtAuthenticationMiddleware,
    BasicServiceAuthenticationMiddleware,
    ServiceAuthenticationMiddleware,
    AuthMiddleware
};
