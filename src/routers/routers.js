const AbstractRouter = require("./base/abstract-router");
const BaseRouter = require("./base/base-router");
const ExpressRouter = require("./base/express-router");
const SocketsRouter = require("./base/sockets-router");

module.exports = {
    /** @deprecated */
    BaseRouter,
    ExpressRouter,
    SocketsRouter,
    AbstractRouter
};