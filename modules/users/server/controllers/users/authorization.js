'use strict';

/**
 * Module dependencies
 */
const mongoose = require('mongoose');
const User = mongoose.model('User');
const errors = require('../../../../../utilities/errors');

/**
 * User middleware
 */
async function userByUsername(req, res, next) {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });

        if (!user) { throw new errors.InvalidData('Invalid username.'); }
        req.user = user;
        next();
    } catch (e) {
        return next(e);
    }
}

module.exports = { userByUsername };
