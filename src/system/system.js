const { start } = require("./application");
const controllers = require("../controllers/controllers");
const middlewares = require("../middlewares/middlewares");
const services = require("../services/services");
const routers = require("../routers/routers");
const helpers = require("../helpers/helpers");
const engines = require("./engines/engines");

module.exports = {
    start,
    controllers,
    middlewares,
    services,
    helpers,
    routers,
    engines
};