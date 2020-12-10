'use strict';

const jwt = require('jsonwebtoken');

const keymanager = require('../../../jwt/server/controllers/keymanager');
const errors = require('../../../../utilities/errors');

async function jwtCheck(req, res, next) {
    try {
        const token = req.token;
        if (!token) {
            throw new errors.InvalidData('JWT Token is required');
        }
        var tempDecode = jwt.decode(token);
        const key = await keymanager.read(tempDecode.user._id);
        const decode = jwt.verify(token, key);
        if (!decode.user) {
            throw new errors.InvalidData('User not found');
        }
        req.user = decode.user;
        next();
    } catch (e) {
        throw new errors.InvalidData(e.message);
    }
}

module.exports = {
    jwtCheck,
};
