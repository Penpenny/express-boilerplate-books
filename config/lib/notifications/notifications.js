const axios = require('axios');

const config = require('../../../config/config');
const notificationService = config.notificationService.url;
const errors = require('../utility/errors')

async function email(data) {
    try {
        const result = await axios.post(`${notificationService}/email`, data);
        return result.data.data;
    } catch (e) {
        return new errors.InvalidData(e);
    }
}

async function pushnotification(data) {
    try {
        const result = await axios.post(`${notificationService}/pushnotification`, data);
        return result.data.data;
    } catch (e) {
        return new errors.InvalidData(e);
    }
}

module.exports = {
    email,
    pushnotification,
};
