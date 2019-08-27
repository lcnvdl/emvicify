const BaseMiddleware = require("./base/base-middleware");
const jwt = require('express-jwt');

class JwtMiddleware extends BaseMiddleware {
    generate(options) {
        return jwt(options);
    }
}

module.exports = JwtMiddleware;