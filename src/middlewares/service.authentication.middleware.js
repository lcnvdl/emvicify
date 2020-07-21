const BaseMiddleware = require("./base/base-middleware");

class ServiceAuthenticationMiddleware extends BaseMiddleware {
    get authenticationService() {
        return (this.services.auth || this.services.authentication);
    }

    processForService(authString) {
        return authString;
    }

    getAuthStringFromHeaders(headers) {
        return headers.authorization;
    }

    generate() {
        return (req, res, next) => {
            let authString = this.getAuthStringFromHeaders(req.headers);

            if (!authString || authString === "") {
                return res.status(403).json({
                    error: "Forbidden",
                    status: 403
                });
            }

            try {
                let request = this.processForService(authString);

                this.authenticationService.validateRequest(request).then(info => {
                    req.locals = req.locals || {};
                    req.locals.auth = info;
                    next();
                }, err => {
                    res.status(401).json({
                        error: err,
                        status: 401
                    });
                });
            }
            catch (err) {
                res.status(500).json({
                    error: err,
                    status: 500
                });
            }
        };
    }
}

module.exports = ServiceAuthenticationMiddleware;