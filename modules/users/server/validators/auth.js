const {
    check
} = require('express-validator/check');

const signup = [
    check('email')
        .exists()
        .isEmail()
        .isLength({
            min: 1
        })
        .withMessage('email is required'),
    check('password')
        .exists()
        .isLength({
            min: 1
        })
];

const signin = [
    check('usernameOrEmail')
        .exists()
        .isLength({
            min: 1
        })
        .withMessage('username or email is required'),
    check('password')
        .exists()
        .isLength({
            min: 1
        })
        .withMessage('password is required')
];

const forgot = [
    check('usernameOrEmail', 'username or email is required')
        .exists()
        .isLength({
            min: 1
        })
];

const fisrtPasswordSet = [
    check('newPassword')
        .exists()
        .isLength({
            min: 1
        })
        .withMessage('new password is required'),
    check('verifyPassword')
        .exists()
        .isLength({
            min: 1
        })
        .withMessage('verify password is required'),
    check('newPassword')
        .isLength({
            min: 1
        })
        .custom((value, {
            req
        }) => {
            if (value !== req.body.verifyPassword) {
                throw new Error('Passwords are not same');
            } else {
                return value;
            }
        })
];

module.exports = {
    signup,
    signin,
    forgot,
    fisrtPasswordSet
    //refreshToken
};