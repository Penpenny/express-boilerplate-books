const errors = require('../../../../utilities/errors');
const Chance = require('chance');
const chance = new Chance();
const mongoose = require('mongoose');
const Key = mongoose.model('Key');

async function create(user) {
    try {
        const key = new Key();
        key.key = chance.guid();
        key.user = user;
        const result = await key.save();
        return result.key;
    } catch (e) {
        throw new errors.InvalidData(e);
    }
}

async function read(user) {
    try {
        const result = await Key.findOne({ user });
        if (!result) throw new errors.InvalidData();
        return result.key;
    } catch (e) {
        throw new errors.InvalidData(e);
    }
}

async function update(user) {
    try {
        const result = await Key.findOneAndUpdate({ user }, { $set: { key: chance.guid() } }, { new: true });
        return result.key;
    } catch (e) {
        throw new errors.InvalidData(e);
    }
}

async function remove(user) {
    try {
        const result = await Key.findOneAndRemove({ user });
        return result.key;
    } catch (e) {
        throw new errors.InvalidData(e);
    }
}

module.exports = {
    create,
    read,
    update,
    remove,
};
