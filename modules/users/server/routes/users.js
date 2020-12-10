const userPolicy = require('../policies/user');

const jwtCheck = require('../utils/index');
module.exports = function(app) {
    // User Routes
    const users = require('../controllers');

    // Setting up the users profile api
    app.route('/users/me').get(jwtCheck.jwtCheck, userPolicy.isAllowed, users.me);
    app.route('/users').put(jwtCheck.jwtCheck, userPolicy.isAllowed, users.update);
    app.route('/users/picture').post(jwtCheck.jwtCheck, userPolicy.isAllowed, users.profilePicture);

    // // get jwt token from refresh token
    // app.route('/api/v1/auth/refreshtoken').post(validator.refreshToken, validatorErrors.validationErrorChecker, jwtCheck.jwtCheck, users.getJwtTokenFromRefreshToken);

    // // Finish by binding the user middleware
    app.param('username', users.userByUsername);
};
