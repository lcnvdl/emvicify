const { asyncForEach } = require("../helpers/async.helper");
const { importModule } = require("./modules-importer");
const { getPluginMemberName } = require("./misc");
const ExpressEngine = require("./engines/express-engine");

const fs = require("fs");
const path = require("path");

const modules = {
    settingsPath: "",
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

    modules.settingsPath = fileName;
}

class EmvicifyApplication {
    constructor() {
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
        expressSettings = {},
        testMode = false,
        engines = []
    } = extra || {};

    if (typeof settingsFile === "string") {
        loadSettings(baseFolder, settingsFile);
    }
    else if (typeof settingsFile === "object") {
        modules.settings = settingsFile;
    }

    const allEngines = {};

    if (engines.length === 0) {
        engines.push(new ExpressEngine(expressApp, port, expressSettings));
    }

    engines.forEach(m => {
        m.prepare();
        allEngines[m.identifier] = m;
    });

    if (configureAppBeforeServe) {
        configureAppBeforeServe(allEngines);
    }

    return new Promise((resolve, reject) => {
        asyncForEach(
            ["middlewares", "services", "controllers", "routers", "plugins"],
            name => importModule(baseFolder, name, modules, {
                getMemberName: (name === "plugins") ? getPluginMemberName : null
            })).then(() => {
                Object.values(modules.routers).forEach(router => router.register(allEngines));

                Object.values(modules.plugins)
                    .filter(m => m.pluginName && m.pluginName !== "")
                    .forEach(m => {
                        if (!modules.plugins.pluginName) {
                            modules.plugins.pluginName = m;
                        }
                    });

                Object.values(modules.plugins)
                    .filter(p => p.events && p.events.configureAppBeforeServe)
                    .forEach(p => p.events.configureAppBeforeServe({ modules, engines: allEngines }));

                Promise.all(Object.keys(allEngines).map(k => allEngines[k].serve())).then(() => {
                    Object.values(modules.plugins)
                        .filter(p => p.events && p.events.appStarted)
                        .forEach(p => p.events.appStarted({ modules, engines: allEngines }));

                    if (testMode) {
                        process.exit(0);
                    }

                    resolve({ baseFolder, engines: allEngines, modules });
                }, err => {
                    reject(err);
                });
            }, err => {
                reject(err);
            });
    });
}

module.exports = {
    start,
    EmvicifyApplication
};
