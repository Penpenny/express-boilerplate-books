const { check } = require('express-validator/check');

const update = [
    check('firstName').optional().custom((value) => {
        if (!value.match(/^[a-zA-Z]+$/)) {
            throw new Error('First name must contain characters only');
        } else { return value; }
    }),
    check('lastName').optional().custom((value) => {
        if (!value.match(/^[a-zA-Z]+$/)) {
            throw new Error('Last name must contain characters only');
        } else { return value; }
    }),
];

const changePassword = [
    check('currentPassword').exists().isLength({ min: 1 }).withMessage('Current password is required'),
    check('newPassword').exists().isLength({ min: 1 }).withMessage('New password is required'),
    check('verifyPassword').exists().isLength({ min: 1 }).withMessage('Verify password is required'),
];
const refreshToken = [
    check('refreshToken').not().isEmpty().withMessage('refreshToken should be provided'),
];

module.exports = {
    update,
    refreshToken,
    changePassword
};
