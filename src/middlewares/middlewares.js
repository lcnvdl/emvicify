module.exports = {
    BaseMiddleware: require("./base/base-middleware"),
    JwtAuthenticationMiddleware: require("./jwt.authentication.middleware"),
    BasicServiceAuthenticationMiddleware: require("./basic.service.authentication.middleware"),
    ServiceAuthenticationMiddleware: require("./service.authentication.middleware"),
    AuthMiddleware: require("./auth.middleware")
};