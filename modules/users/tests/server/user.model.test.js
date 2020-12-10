/**
 * Module dependencies.
 */
const should = require('should');
const mongoose = require('mongoose');
const User = mongoose.model('User');

/**
 * Globals
 */
let user;

/**
 * Unit tests
 */
describe('User Model Unit Tests:', function() {
	beforeEach(async () => {
		user = new User({
			firstName: 'Firstname',
			lastName: 'Lastname',
			displayName: 'Firstname Lastname',
			email: 'admin@gmail.com',
			username: 'adminuser',
			provider: 'local',
			roles: ['admin'],
			password: 'Password@123',
		});
		await user.save();
	});

	describe('Method Save', () => {
		it('Should be able to retrieve user.', async () => {
			const result = await User.findOne({ username: user.username });
			should.exist(result);
		});

		it('Should be able to retrieve user.', async () => {
			const result = await User.findOneAndUpdate(
				{ username: user.username },
				{ lastName: 'lastname' }
			);
			should.exist(result);
		});
		it('Should be able to delete user.', async () => {
			const result = await User.findOneAndRemove({ username: user.username });
			should.exist(result);
		});
	});

	afterEach(async () => {
		await User.remove().exec();
	});
});
