const path = require('path');
const fs = require('fs');
const camelCase = require("camelcase");

async function importModule(baseFolder, name, modules, settings) {
    settings = settings || {};

    const getMemberNameFn = settings.getMemberName || getMemberName;

    await importFiles(baseFolder, "src", name, f => {
        modules[name][getMemberNameFn(f)] = new (require(f))(modules);
    });

    await importFiles(baseFolder, "app", name, f => {
        modules[name][getMemberNameFn(f)] = new (require(f))(modules);
    });
}

function importFiles(baseFolder, appFolder, folder, fn) {
    return new Promise((resolve, reject) => {
        const directoryPath = path.join(baseFolder, appFolder, folder);

        if (!fs.existsSync(directoryPath)) {
            resolve();
            return;
        }

        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                reject(err);
                return;
            }

            files.filter(file => file.indexOf(".js") !== -1).forEach((file) => {
                let fullPath = path.join(directoryPath, file);
                try {
                    fn(fullPath);
                }
                catch (err) {
                    reject(`Error importing ${file}. ${err}.`);
                }
            });

            resolve();
        });
    });
}

function getMemberName(n) {
    return toCamelCase(path.basename(n).split(".")[0]);
}

function toCamelCase(name) {
    return camelCase(name, { pascalCase: false });
}

module.exports = {
    importModule
};