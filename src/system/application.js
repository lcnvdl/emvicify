const express = require("express");
const { asyncForEach } = require("../helpers/async.helper");
const { importModule } = require("./modules-importer");
const bodyParser = require("body-parser");

const modules = {
    services: {},
    controllers: {},
    routers: {},
    middlewares: {},
    drivers: {},
    plugins: []
};

async function start(
    baseFolder,
    port,
    extra) {

    let {
        expressApp = null, 
        configureAppBeforeServe = null, 
        plugins = [], 
        expressSettings = {} 
    } = extra || {};

    const app = expressApp || express();
    const http = require("http").Server(app);

    if (configureAppBeforeServe) {
        configureAppBeforeServe(app, http);

        if (expressSettings.json) {
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({ extended: true }));
        }
    }

    modules.plugins = plugins;

    plugins
        .filter(p => p.events && p.events.configureAppBeforeServe)
        .forEach(p => p.events.configureAppBeforeServe({ app, http, modules }));

    return new Promise((resolve, reject) => {
        asyncForEach(
            ["middlewares", "services", "controllers", "routers"],
            name => importModule(baseFolder, name, modules)).then(() => {
                Object.values(modules.routers).forEach(router => router.register(app));

                http.listen(port, () => {
                    plugins
                        .filter(p => p.events && p.events.appStarted)
                        .forEach(p => p.events.appStarted({ app, http, modules }));

                    resolve({ app, http, modules });
                });
            }, err => {
                reject(err);
            });
    });
}

module.exports = {
    start
};
