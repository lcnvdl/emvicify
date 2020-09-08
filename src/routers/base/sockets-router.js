const AbstractRouter = require("./abstract-router");
const AsyncHelper = require("../../helpers/async.helper");
const EventEmitter = require("events");

class SocketsRouter extends AbstractRouter {
    constructor(objects) {
        super(objects);

        this.drivers = objects.drivers;
        this.connections = {};
        this.events = new EventEmitter();

        AsyncHelper.waitFor(() => this.driver).then(() => {
            this.__subscribe();
        });
    }

    get driver() {
        return this.drivers.sockets;
    }

    connect(cb) {
        this.events.on("connect", cb);
    }

    message(cb) {
        this.events.on("message", cb);
    }

    post(url, actionFn, middlewares) {
        this.events.on(`post.${url}`, (connection, req) => {
            const res = this.__toResponseManager(connection);

            if (middlewares && middlewares.length > 0) {
                let queue = [middlewares[0]];
                let finished = false;
                let processed = 0;

                while (queue.length > 0) {
                    const m = queue.pop();
                    m(req, res, () => {
                        const next = middlewares[++processed];
                        if (!next) {
                            finished = true;
                        }
                        else {
                            queue.push(next);
                        }
                    });
                }

                if (!finished) {
                    return;
                }
            }

            const result = actionFn(req);
            this.processResult(req, res, result);
        });
    }

    disconnect(cb) {
        this.events.on("disconnect", cb);
    }

    __subscribe() {
        this.driver.onConnect(connection => {
            this.connections[connection.id] = connection;
            this.events.emit("connect", connection);
        });

        this.driver.onMessage((connection, data) => {
            console.log(`Received from ${connection.id}`, data);
            this.events.emit("message", connection, data);

            if (data[0] == "{") {
                const json = JSON.parse(data);
                if (json.url && json.action) {
                    this.events.emit(`post.${json.url}`, connection, json.data);
                }
            }
            else {
                this.events.emit("text", connection, data);
            }
        });

        this.driver.onDisconnect(connection => {
            delete this.connections[connection.id];
            this.events.emit("disconnect", connection);
        });
    }

    __toResponseManager(connection) {
        let res = {
            response: { status: 200, content: null },
            status(number) {
                res.response.status = number;
                return res;
            },
            send(text) {
                res.response.content = text;
                this.driver.sendTo(connection, res.response);
            },
            json(obj) {
                res.send(JSON.stringify(obj));
            }
        };

        return res;
    }
}

module.exports = SocketsRouter;
