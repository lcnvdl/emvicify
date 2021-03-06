const BaseEngine = require("../base/base-engine");
const AsyncHelper = require("../../helpers/async.helper");
const EventEmitter = require('events');
const RequestModel = require("./models/request-model");
const ResponseModel = require("./models/response-model");

class RabbitMQEngine extends BaseEngine {
    constructor(amqp, amqpSettings) {
        super();
        this.amqp = amqp;
        this.settings = amqpSettings || {};
        this.channel = null;
        this.connection = null;
        this.exchange = null;
        this.queue = null;
        this.isBidirectional = false;
        this.waiting = {};
        this.multipleMessages = false;
        this.ackMode = null;
        this.events = new EventEmitter();
    }

    get identifier() {
        return "amqpEngine";
    }

    get model() {
        return this.settings.communicationModel;
    }

    get ackRequired() {
        if (this.ackMode !== null) {
            return this.ackMode;
        }

        return !this.multipleMessages;
    }

    get url() {
        let url = "";
        if (!this.settings.protocol) {
            url += "amqp://";
        }
        else {
            url += this.settings.protocol + "://";
        }

        if (this.settings.user) {
            url += this.settings.user;

            if (this.settings.password) {
                url += ":" + this.settings.password;
            }

            url += "@";
        }

        if (this.settings.host) {
            url += this.settings.host;
        }
        else {
            url += "localhost";
        }

        if (this.settings.port) {
            url += ":" + this.settings.port;
        }

        if (this.settings.vhost) {
            url += "/" + this.settings.vhost;
        }

        return url;
    }

    prepare() {
    }

    onReceive(listener) {
        this.events.on("receive", listener);
    }

    /**
     * @param {RequestModel} message 
     * @param {boolean} waitForAnswer 
     * @returns {Promise<any>}
     */
    triggerReceive(message, waitForAnswer) {
        return new Promise((resolve, reject) => {
            this.events.emit("receive", message, (reply, err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(reply);
                }
            });

            if (!waitForAnswer) {
                resolve(null);
            }
            else {
                setTimeout(() => reject("Timeout"), 5000);
            }
        });
    }

    async _connect() {
        this.connection = await this.amqp.connect(this.url);
        process.once('SIGINT', () => this.connection.close.bind(this.connection));
    }

    async _createChannel() {
        this.channel = await this.connection.createChannel();
    }

    async _createCommunicationModel() {
        if (this.model.mode === "sender") {
            await this._createCommunicationModelAsSender();
        }
        else if (this.model.mode === "receiver") {
            await this._createCommunicationModelAsReceiver();
        }
        else {
            throw new Error("Invalid communication model mode. It must be 'sender' or 'receiver'.");
        }
    }

    async _processMessage(msg, properties) {
        const request = RequestModel.parse(msg);

        let reply;

        try {
            const data = await this.triggerReceive(request, this.isBidirectional && properties.replyTo);
            reply = new ResponseModel(request.id, request.url, data, {}, 200);
        }
        catch (err) {
            reply = new ResponseModel(request.id, request.url, err, {}, 500);
        }

        if (this.isBidirectional && reply) {
            this.channel.sendToQueue(
                properties.replyTo,
                Buffer.from(reply.toString()), {
                correlationId: properties.correlationId
            });
        }
    }

    async _createCommunicationModelAsReceiver() {
        //  N = All clients, X = Some clients, E = Exchange, Q = Queue, C = Client, Qx = Autogenerated Queue
        //
        //  Model 1 -> 1:       C1 sends a message to the queue Q1. C2, C.., Cn listens to Q1.
        //  Model 1 -> 1..N:    C1 sends a message to the fanout exchange E1, using a queue Qx. 
        //                          C2, C.., Cn listens to E1, using a Qx.
        //  Model 1 -> 0..X:    C1 sends a message to the direct exchange E1, using a queue Qx. 
        //                          C2, C.., Cn listens to E1, using a Qx.
        //  Model 1 <-> C:      C1 sends a message to a client C2, and receives the answer. 
        //                          In order to receive an answer, C1 creates a Qx, and sends the
        //                          id in the message. C2 replies directly to Qx.

        const name = this.model.name;
        const bidirectional = name.includes("<->");
        const right = name.substr(name.indexOf(">") + 1).toLowerCase();

        if (right === "1") {
            if (!this.model.queueName || this.model.queueName === "") {
                throw new Error("A queue name is required for this schema.");
            }

            this.queue = await this.channel.assertQueue(this.model.queueName, { durable: false });

            if (!this.multipleMessages) {
                this.channel.prefetch(1);
            }

            this.channel.consume(this.model.queueName, (msg) => {
                this._processMessage(msg.content.toString(), msg.properties || {});

                if (this.ackRequired) {
                    this.channel.ack(msg);
                }
            }, {
                noAck: !this.ackRequired
            });

        }
        else if (right === "1..n") {
            this.exchange = await this.channel.assertExchange(this.model.exchangeName, "fanout", { durable: false });

            this.queue = await this.channel.assertQueue("", {
                exclusive: true
            });

            if (!this.multipleMessages) {
                this.channel.prefetch(1);
            }

            await this.channel.bindQueue(this.queue.queue, this.exchange.exchange, '');

            this.channel.consume(this.model.queueName, msg => {
                this._processMessage(msg.content.toString(), msg.properties || {});

                if (this.ackRequired) {
                    this.channel.ack(msg);
                }
            }, {
                noAck: !this.ackRequired
            });
        }
        else if (right === "0..x") {
            this.exchange = await this.channel.assertExchange(this.model.exchangeName, "direct", { durable: false });

            this.queue = await this.channel.assertQueue("", {
                exclusive: true
            });

            if (!this.multipleMessages) {
                this.channel.prefetch(1);
            }

            await this.channel.bindQueue(this.queue.queue, this.exchange.exchange, this.model.key);

            this.channel.consume(this.model.queueName, async (msg) => {
                await this._processMessage(msg.content.toString(), msg.properties || {});

                if (this.ackRequired) {
                    this.channel.ack(msg);
                }
            }, {
                noAck: !this.ackRequired
            });
        }
        else {
            throw new Error("Invalid schema: " + right);
        }

        this.isBidirectional = bidirectional;
    }

    async _createCommunicationModelAsSender() {
        //  N = All clients, X = Some clients, E = Exchange, Q = Queue, C = Client, Qx = Autogenerated Queue
        //
        //  Model 1 -> 1:       C1 sends a message to the queue Q1. C2, C.., Cn listens to Q1.
        //  Model 1 -> 1..N:    C1 sends a message to the fanout exchange E1, using a queue Qx. 
        //                          C2, C.., Cn listens to E1, using a Qx.
        //  Model 1 -> 0..X:    C1 sends a message to the direct exchange E1, using a queue Qx. 
        //                          C2, C.., Cn listens to E1, using a Qx.
        //  Model 1 <-> C:      C1 sends a message to a client C2, and receives the answer. 
        //                          In order to receive an answer, C1 creates a Qx, and sends the
        //                          id in the message. C2 replies directly to Qx.

        if (!this.model) {
            throw new Error("Communication model is not defined");
        }

        const name = this.model.name;
        const bidirectional = name.includes("<->");
        const right = name.substr(name.indexOf(">") + 1).toLowerCase();

        if (right === "1") {
            if (!this.model.queueName || this.model.queueName === "") {
                throw new Error("A queue name is required for this schema.");
            }

            this.queue = await this.channel.assertQueue(this.model.queueName, { durable: false });
        }
        else if (right === "1..n") {
            this.exchange = await this.channel.assertExchange(this.model.exchangeName, "fanout", { durable: false });
        }
        else if (right === "0..x") {
            this.exchange = await this.channel.assertExchange(this.model.exchangeName, "direct", { durable: false });
        }
        else {
            throw new Error("Invalid schema: " + right);
        }

        this.isBidirectional = bidirectional;
    }

    /**
     * @param {*} message Message
     * @param {string} [destination] Destination (optional)
     * @param {boolean} [dontWaitAnAnswer] Don't wait an answer (optional)
     */
    async send(data, destination, waitAnAnswer) {
        const id = v1();

        const request = new RequestModel(id, url, data);

        if (destination) {
            request.addHeader("destination", destination);
        }

        const message = request.toString();

        if (this.isBidirectional && (typeof waitAnAnswer === "undefined" || waitAnAnswer === true)) {
            const { timeout = defaultTimeout } = opciones || {};

            const q = await this.channel.assertQueue("", { exclusive: true });

            this.channel.consume(q.queue, msg => {
                if (msg && msg.properties.correlationId === id) {
                    this.waiting[id].response = JSON.parse(msg.content.toString());
                }
            }, {
                noAck: true
            });

            this.waiting[id] = { message, response: null };

            let result;

            if (this.exchange) {
                result = this.channel.publish(
                    this.model.exchangeName,
                    destination || this.exchange.key || "",
                    Buffer.from(message),
                    {
                        correlationId: id,
                        replyTo: q.queue
                    });
            }
            else {
                result = this.channel.sendToQueue(
                    this.model.queueName,
                    Buffer.from(message),
                    {
                        correlationId: id,
                        replyTo: q.queue
                    });
            }

            if (!result) {
                delete this.waiting[id];
                throw new Error("Error trying to send the message");
            }

            let reply = null;

            try {
                await AsyncHelper.waitFor(() => this.espera[id].response, defaultSleepTime, timeout);

                reply = this.espera[id].response;
            }
            finally {
                delete this.espera[id];
                AsyncHelper.sleep(100).finally(() => this.channel.deleteQueue(q.queue));
            }

            return reply;
        }
        else {
            let result;

            if (this.exchange) {
                result = this.channel.publish(
                    this.model.exchangeName,
                    destination || "",
                    Buffer.from(message));
            }
            else {
                result = this.channel.sendToQueue(
                    this.model.queueName,
                    Buffer.from(message));
            }

            if (!result) {
                throw new Error("Error trying to send the message");
            }

            return null;
        }
    }

    async serve() {
        await this._connect();
        await this._createChannel();
        await this._createCommunicationModel();
    }

    close() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
    }
}

module.exports = RabbitMQEngine;
