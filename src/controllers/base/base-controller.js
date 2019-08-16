class BaseController {
    constructor({ settings, services }) {
        this.services = services;
        this.settings = settings;
    }
}

module.exports = BaseController;