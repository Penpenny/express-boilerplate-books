'use strict';
const validator = require('../validators/auth');
const validatorErrors = require('../../../../utilities/validatorerrors');

module.exports = function(app) {
    // User Routes
    const users = require('../controllers/index');

    // Setting up the users password api
    app.route('/auth/forgot').post(validator.forgot, validatorErrors.validationErrorChecker, users.forgot);
    app.route('/auth/reset/:token/:email').get(users.validateResetToken);
    app.route('/auth/reset/:token').post(validator.fisrtPasswordSet, validatorErrors.validationErrorChecker, users.reset);

    // Signup route
    app.route('/auth/signup').post(validator.signup, validatorErrors.validationErrorChecker, users.signup);

    // Signin Route
    app.route('/auth/signin').post(validator.signin, validatorErrors.validationErrorChecker, users.signin);
};
