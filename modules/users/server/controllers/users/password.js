'use strict';

/**
 * Module dependencies
 */
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const keymanager = require('../../../../jwt/server/controllers/keymanager');
const errors = require('../../../../../utilities/errors');
const errorHandler = require('../../../../core/server/controllers/errors');

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = async(req, res) => {
    try {
        const token = crypto.randomBytes(20).toString('hex');
        const usernameOrEmail = String(req.body.usernameOrEmail).toLowerCase();
        const user = await User.findOne({ email: usernameOrEmail }, '-salt -password');
        if (!user) {
            throw new errors.NotFound('No account with that username or email has been found');
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        res.jsonp({
            message: 'An email has been sent to the provided email with further instructions.'
        });
    } catch (e) {
        throw new errors.ExpErrorHandler(errorHandler.getErrorMessage(e));
    }
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = async(req, res) => {
    try {
        const { email, token } = req.params;
        const user = await User.findOne({
            resetPasswordToken: token,
            email,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            throw new errors.InvalidData('Invalid Token.');
        }
        res.send({ message: 'Reset token validated successfully.' });
    } catch (e) {
        throw new errors.ExpErrorHandler(errorHandler.getErrorMessage(e));
    }
};

/**
 * Reset password POST from email token
 */
exports.reset = async(req, res) => {
    try {
        // Init Variables
        const passwordDetails = req.body;
        var user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        });
        if (!user) {
            throw new errors.InvalidData('Password reset token is invalid or has expired.');
        }
        if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
            user.password = passwordDetails.newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            await keymanager.update(user._id);
            res.jsonp({ message: 'Please login to continue' });
        } else {
            throw new errors.InvalidData('Passwords do not match');
        }
    } catch (e) {
        throw new errors.ExpErrorHandler(errorHandler.getErrorMessage(e));
    }
};


/**
 * Change Password
 */
exports.changePassword = async(req, res) => {
    try {
        const {
            newPassword,
            currentPassword,
            verifyPassword
        } = req.body;
        if (!req.user) {
            throw new errors.NotAllowed('User is not signed in');
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new errors.NotFound('User not found');
        }
        if (user.authenticate(currentPassword)) {
            if (newPassword !== verifyPassword) {
                throw new errors.InvalidData('New Password and Verify Password do not match');
            }
            user.password = newPassword;
            await user.save();
            res.send({ message: 'Password changed successfully' });
        } else {
            throw new errors.InvalidData('Current password is incorrect');
        }
    } catch (e) {
        throw new errors.ExpErrorHandler(errorHandler.getErrorMessage(e));
    }
};
