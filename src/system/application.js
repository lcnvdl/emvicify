const express = require("express");
const { asyncForEach } = require("../helpers/async.helper");
const { importModule } = require("./modules-importer");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const modules = {
    settings: {},
    services: {},
    controllers: {},
    routers: {},
    middlewares: {},
    drivers: {},
    plugins: {}
};

function loadSettings(baseFolder, fileName) {
    fileName = fileName || "./settings.json";

    if (fileName.indexOf("./") === 0) {
        fileName = path.join(baseFolder, fileName);
    }

    if (fs.existsSync(fileName)) {
        modules.settings = Object.assign({}, JSON.parse(fs.readFileSync(fileName)));
    }
}

async function start(
    baseFolder,
    port,
    extra) {

    let {
        settingsFile = null,
        expressApp = null,
        configureAppBeforeServe = null,
        expressSettings = {}
    } = extra || {};

    if (typeof settingsFile === "string") {
        loadSettings(baseFolder, settingsFile);
    }
    else if (typeof settingsFile === "object") {
        modules.settings = settingsFile;
    }

    const app = expressApp || express();
    const http = require("http").Server(app);

    if (configureAppBeforeServe) {
        configureAppBeforeServe(app, http);
    }

    if (expressSettings.json) {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
    }

    return new Promise((resolve, reject) => {
        asyncForEach(
            ["middlewares", "services", "controllers", "routers", "plugins"],
            name => importModule(baseFolder, name, modules)).then(() => {
                Object.values(modules.routers).forEach(router => router.register(app));

                Object.values(modules.plugins)
                    .filter(p => p.events && p.events.configureAppBeforeServe)
                    .forEach(p => p.events.configureAppBeforeServe({ app, http, modules }));

                http.listen(port, () => {
                    Object.values(modules.plugins)
                        .filter(p => p.events && p.events.appStarted)
                        .forEach(p => p.events.appStarted({ app, http, modules }));

                    resolve({ baseFolder, app, http, modules });
                });
            }, err => {
                reject(err);
            });
    });
}

module.exports = {
    start
};
