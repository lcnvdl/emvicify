const BaseMiddleware = require("./base/base-middleware");

class ServiceAuthenticationMiddleware extends BaseMiddleware {
    get authenticationService() {
        return (this.services.auth || this.services.authentication);
    }

    processForService(authString) {
        return authString;
    }

    generate() {
        return (req, res, next) => {
            let authString = req.headers.authorization;
            
            if (!authString || authString === "") {
                res.status(403).json({
                    error: "Forbidden",
                    status: 403
                });
            }

            this.authenticationService.validateRequest(this.processForService(authString)).then(info => {
                req.locals = req.locals || {};
                req.locals.auth = info;
                next();
            }, err => {
                res.status(401).json({
                    error: err,
                    status: 401
                });
            });
        };
    }
}

module.exports = ServiceAuthenticationMiddleware;