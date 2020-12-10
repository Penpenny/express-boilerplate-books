/**
 * Created by jivan on 4/13/17.
 */
'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema;

/**
 * JwtRefreshToken Schema
 */
const JwtRefreshTokenSchema = new Schema({
    refreshToken: {
        type: String,
        trim: true,
        required: 'true'
    },
    user: {
        type: Schema.ObjectId,
        refer: 'User'
    },
    valid: {
        type: Date,
        default: moment().add(2, 'days')
    },
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('JwtRefreshToken', JwtRefreshTokenSchema);
