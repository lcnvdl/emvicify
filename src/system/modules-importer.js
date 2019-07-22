const path = require('path');
const fs = require('fs');

async function importModule(baseFolder, name, modules) {
    await importFiles(baseFolder, name, f => {
        modules[name][getName(f)] = new (require(f))(modules);
    });
}

function importFiles(baseFolder, folder, fn) {
    return new Promise((resolve, reject) => {
        const directoryPath = path.join(baseFolder, "src", folder);

        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                reject(err);
                return;
            }

            files.filter(file => file.indexOf(".js") !== -1).forEach((file) => {
                let fullPath = path.join(directoryPath, file);
                fn(fullPath);
            });

            resolve();
        });
    });
}

function getName(n) {
    return path.basename(n).split(".")[0];
}

module.exports = {
    importModule
};