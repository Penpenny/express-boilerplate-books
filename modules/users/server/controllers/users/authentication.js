'use strict';

/**
 * Module dependencies
 */
const _ = require('lodash'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    jwt = require('jsonwebtoken'),
    User = mongoose.model('User'),
    Chance = require('chance'),
    moment = require('moment'),
    JwtRefreshToken = mongoose.model('JwtRefreshToken'),
    config = require('../../../../../config/config'),
    errorHandler = require('../../../../core/server/controllers/errors');
const keymanager = require('../../../../jwt/server/controllers/keymanager');
const errors = require('../../../../../utilities/errors');
const errorMessages = require('../../../../../utilities/errormessages');

const whitelistedFields = ['_id', 'roles', 'username'];
const chance = new Chance();
const {
    JWT_KEY_NOT_FOUND,
} = errorMessages;

// perform passport authentication
async function passportAuthenticate(req, res, next) {
    try {
        return new Promise((resolve, reject) => {
            passport.authenticate('local', (err, user, info) => {
                if (err || !user) {
                    reject(info.message);
                }
                if (user) {
                    user.password = undefined;
                    user.salt = undefined;
                    resolve(user);
                }
            })(req, res, next);
        });
    } catch (e) {
        throw new errors.ExpErrorHandler(errorHandler.getErrorMessage(e));
    }
}
// find unique username
async function findUniqueUsername(username, suffix) {
    try {
        let possibleUsername = username.toLowerCase() + (suffix || '');
        let user = await User.findOne({
            username: possibleUsername
        });
        if (!user) {
            return possibleUsername;
        } else {
            return findUniqueUsername(username, (suffix || 0) + 1);
        }
    } catch (e) {
        throw new errors.ExpErrorHandler(errorHandler.getErrorMessage(e));
    }
}

// sign the jwt token
async function signToken(user) {
    try {
        const result = await keymanager.read(user._id);
        if (!result) {
            throw new errors.InvalidData(JWT_KEY_NOT_FOUND);
        }
        user = _.pick(user, whitelistedFields);
        return jwt.sign({
            user: user
        }, result, {
            expiresIn: config.jwt.expiresIn
        });
    } catch (e) {
        throw new errors.ExpErrorHandler(errorHandler.getErrorMessage(e));
    }
}

// save jwt refresh token
async function saveJwtRefreshToken(user) {
    try {
        const token = chance.guid();
        const jwtRefreshToken = new JwtRefreshToken({
            user: user,
            refreshToken: token
        });
        return jwtRefreshToken.save();
    } catch (e) {
        throw new errors.ExpErrorHandler(errorHandler.getErrorMessage(e));
    }
}

// build the login and signup token response
async function token(user) {
    try {
        const token = await signToken(user);
        const refreshToken = await saveJwtRefreshToken(user._id);
        const response = {
            token: token,
            expiresIn: config.jwt.expiresIn,
            refreshToken: refreshToken.refreshToken,
            refreshTokenExpiresAt: refreshToken.valid,
        };
        return response;
    } catch (e) {
        throw new errors.ExpErrorHandler(errorHandler.getErrorMessage(e));
    }
}

// user signup
async function signup(req, res) {
    let user = new User(req.body);
    try {
        delete req.body.roles;
        user.provider = 'local';
        user.displayName = `${user.firstName} ${user.lastName}`;
        let possibleUsername = `${user.firstName}-${user.lastName}` || ((user.email) ? user.email.split('@')[0] : '');
        user.username = await findUniqueUsername(possibleUsername, null);
        await user.save();
        await keymanager.create(user._id);
        const response = await token(user);
        res.json(response);
    } catch (e) {
        await user.remove();
        throw new errors.ExpErrorHandler(errorHandler.getErrorMessage(e));
    }
}

/**
 * user sign in
 */
async function signin(req, res, next) {
    try {
        let user = await passportAuthenticate(req, res, next);
        if (!user || user.roles.indexOf('user') < 0) {
            throw new errors.UnauthorizedAccess('You are not allowed to access this service.');
        }
        const response = await token(user);
        res.jsonp(response);
    } catch (e) {
        throw new errors.ExpErrorHandler(errorHandler.getErrorMessage(e));
    }
}

/**
 * Jwt Refreh token
 * @param {*} req
 * @param {*} res
 */
async function getJwtTokenFromRefreshToken(req, res) {
    try {
        const {
            refreshToken
        } = req.body;
        const user = req.user;
        const request = {
            user: user._id,
            refreshToken: refreshToken
        };
        const result = await JwtRefreshToken.findOne(request);
        // check validity or if result exists
        if (!result || result.valid < new moment().subtract(2, 'days')) throw new errors.InvalidData();
        moment().subtract;
        const token = await signToken(user);
        const newRefreshToken = await saveJwtRefreshToken(user._id);
        // remove previous refresh token
        await result.remove();
        return res.status(200).send({
            token: token,
            tokenExpiresIn: config.jwt.expiresIn,
            refreshToken: newRefreshToken.refreshToken,
            refreshTokenExpiresAt: newRefreshToken.valid,
        });
    } catch (e) {
        throw new errors.InvalidData('Something went wrong!');
    }
}

module.exports = {
    signup,
    signin,
    getJwtTokenFromRefreshToken,
};
