const request = require('supertest');
const path = require('path');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const express = require(path.resolve('./config/lib/express'));
const keymanager = require('../../../jwt/server/controllers/keymanager');
var expect = require('chai').expect;

/**
 * Globals
 */
let app, user, agent, credentials, userData;
/**
 * User routes tests
 */
describe('User test cases', () => {
	before(async () => {
		// Get application
		app = await express.init(mongoose);
		agent = await request.agent(app);
	});

	beforeEach(async () => {
		// Create user credentials
		credentials = {
			usernameOrEmail: 'jivan.ghadage@scholarnex.com',
			password: 'hppavanOP{}2',
		};

		user = new User({
			firstName: 'Jivan',
			lastName: 'G',
			email: 'jivan.ghadage@scholarnex.com',
			username: 'jivan',
			password: 'hppavanOP{}2',
			dob: '09/08/1994',
			provider: 'local',
		});

		userData = {
			firstName: 'testing',
			lastName: 'ooooh',
			email: 'testing95@gmail.com',
			password: 'Testing@95',
			dob: '09/08/1994',
			provider: 'local',
		};
		await user.save();
		await keymanager.create(user._id);
		await User.findOneAndUpdate({ email: 'jivan.ghadage@scholarnex.com' }, { roles: 'admin' });
	});

	it('Should be able to sign up.', async () => {
		await agent
			.post('/auth/signup')
			.send(userData)
			.expect(200);
	});

	it('Should be able to log in.', async () => {
		await agent
			.post('/auth/signin')
			.send(credentials)
			.expect(200);
	});

	it('Should not able to log in if password is empty.', async () => {
		credentials.password = '';
		await agent
			.post('/auth/signin')
			.send(credentials)
			.expect(422);
	});

	it('Should not able to log in if username or email is empty.', async () => {
		credentials.usernameOrEmail = '';
		await agent
			.post('/auth/signin')
			.send(credentials)
			.expect(422);
	});

	it('Should not able to log in if username and password both are empty.', async () => {
		credentials.password = '';
		credentials.usernameOrEmail = '';
		await agent
			.post('/auth/signin')
			.send(credentials)
			.expect(422);
	});

	it('Should be able to request reset password.', async () => {
		const data = {
			usernameOrEmail: credentials.usernameOrEmail,
		};
		const res = await agent
			.post('/auth/forgot')
			.send(data)
			.expect(200);

		expect(res).to.not.be.empty;
	});

	it('Should not able to request reset password with wrong username or email.', async () => {
		const data = {
			usernameOrEmail: 'wrongusername',
		};
		await agent
			.post('/auth/forgot')
			.send(data)
			.expect(404);
	});

	it('Should not able to request reset password with empty username or email.', async () => {
		const data = {
			usernameOrEmail: '',
		};
		await agent
			.post('/auth/forgot')
			.send(data)
			.expect(422);
	});

	it('Should not able to request reset password without username or email.', async () => {
		await agent.post('/auth/forgot').expect(422);
	});

	it('Should not be able to set password without reset password token.', async () => {
		const data = {
			newPassword: 'Lucky@9894',
			verifyPassword: 'Lucky@9894',
		};
		await agent
			.post('/auth/reset/')
			.send(data)
			.expect(404);
	});

	it('Should not be able to set password if both passwords are not same.', async () => {
		const data = {
			newPassword: 'Lucky@9898',
			verifyPassword: 'Lucky@9894',
		};
		await agent
			.post(`/auth/reset/${user.resetPasswordToken}`)
			.send(data)
			.expect(422);
	});

	it('Should not be able to set password if rese password token is wrong.', async () => {
		const data = {
			newPassword: 'Lucky@9894',
			verifyPassword: 'Lucky@9894',
		};
		await agent
			.post('/auth/reset/67175ae3529e3a968dfe5a795c58a214a87267')
			.send(data)
			.expect(400);
	});

	it('Should not be able to set password if new password is not available.', async () => {
		const data = {
			verifyPassword: 'Lucky@9894',
		};
		await agent
			.post(`/auth/reset/${user.resetPasswordToken}`)
			.send(data)
			.expect(422);
	});

	it('Should not be able to set password if new password is empty.', async () => {
		const data = {
			newPassword: '',
			verifyPassword: 'Lucky@9894',
		};
		await agent
			.post(`/auth/reset/${user.resetPasswordToken}`)
			.send(data)
			.expect(422);
	});

	it('Should not be able to set password if verify password is not available.', async () => {
		const data = {
			newPassword: 'Lucky@9894',
		};
		await agent
			.post(`/auth/reset/${user.resetPasswordToken}`)
			.send(data)
			.expect(422);
	});

	it('Should not be able to set password if new password is empty.', async () => {
		const data = {
			newPassword: 'Lucky@9894',
			verifyPassword: '',
		};
		await agent
			.post(`/auth/reset/${user.resetPasswordToken}`)
			.send(data)
			.expect(422);
	});

	it('Should not be able to set password if new password and verify password both are empty.', async () => {
		const data = {
			newPassword: '',
			verifyPassword: '',
		};
		await agent
			.post(`/auth/reset/${user.resetPasswordToken}`)
			.send(data)
			.expect(422);
	});

	it('Should not be able to set password if new password and verify password both are not available.', async () => {
		await agent.post(`/auth/reset/${user.resetPasswordToken}`).expect(422);
	});

	afterEach(async () => {
		await User.remove().exec();
		await keymanager.remove(user._id);
	});
});
