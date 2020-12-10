const axios = require('axios');

const config = require('../../config');
const elastiSearchNodeServiceUrl = config.elastiSearchNodeServiceUrl.url;

async function update(user) {
    try {
        const result = await axios.put(`${elastiSearchNodeServiceUrl}/search/${user.id}`, { lock: user.lock });
        return result;
    } catch (e) {
        //return new errors.InvalidData(e);
    }
}

module.exports = {
    update
};
