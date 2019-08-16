class BaseService {
    constructor({ settings, services }) {
        this.services = services;
        this.settings = settings;
    }
}

module.exports = BaseService;