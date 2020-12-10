'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');
const errorHandler = require('../../../../core/server/controllers/errors');
const errors = require('../../../../../utilities/errors');

var readWhitelistedFields = [
	'_id',
	'firstName',
	'lastName',
	'status',
	'timezone',
	'mobile',
	'email',
	'username',
	'displayName',
	'profileImageURL',
	'roles',
	'lock',
];
var whitelistedFields = ['firstName', 'lastName', 'timezone', 'mobile', 'profileImageURL'];
/**
 * Update user details
 */
async function update(req, res) {
	try {
		var tempUser = req.user;
		tempUser = _.extend(tempUser, _.pick(req.body, whitelistedFields));
		var user = await User.update(
			{
				_id: tempUser._id,
			},
			tempUser,
			{
				upsert: true,
			}
		);
		user = await User.findById(tempUser._id);
		user.displayName = user.firstName + ' ' + user.lastName;
		user.updated = Date.now();
		await user.save();
		user = _.pick(user, readWhitelistedFields);
		return res.status(200).send(user);
	} catch (e) {
		throw new errors.ExpErrorHandler(errorHandler.getErrorMessage(e));
	}
}

/**
 * Send User
 */
async function me(req, res) {
	try {
		const user = req.user;
		let result = await User.findById(user._id);
		result.salt = undefined;
		result.password = undefined;
		result = _.pick(result, readWhitelistedFields);
		return res.status(200).send(result);
	} catch (e) {
		throw new errors.ExpErrorHandler(errorHandler.getErrorMessage(e));
	}
}

/**
 * update profile picture
 */
async function profilePicture(req, res) {
	try {
		const { profileImageURL } = req.body;
		let user = await User.findById(req.user._id);
		user.profileImageURL = profileImageURL;
		await user.save();
		user = _.pick(user, readWhitelistedFields);
		return res.status(200).send(user);
	} catch (e) {
		throw new errors.ExpErrorHandler(errorHandler.getErrorMessage(e));
	}
}

module.exports = {
	update,
	me,
	profilePicture,
};
