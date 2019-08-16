const BaseService = require("./base/base-service");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class JwtAuthService extends BaseService {
    generateAccessToken(payload, expiresIn) {
        const secret = this.settings.jwt.secret;
        expiresIn = expiresIn || 24 * 60 * 60;
        return jwt.sign(payload, secret, { expiresIn })
    }

    encryptPassword(password) {
        bcrypt.hashSync(password);
    }
}

module.exports = JwtAuthService;