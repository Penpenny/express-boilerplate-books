const jwt = require('jsonwebtoken');

const keymanager = require('../modules/jwt/server/controllers/keymanager');
const errors = require('../utilities/errors');

async function aclCheck(acl, roles, path, method, res, next) {
    return new Promise((resolve, reject) => {
        acl.areAnyRolesAllowed(roles, path, method, (err, isAllowed) => {
            if (err) {
                res.status(422).send(info);
            } else {
                if (isAllowed) {
                    resolve(next());
                } else {
                    res.status(403).send({
                        message: 'User is not authorized'
                    });
                }
            }
        });
    });
}

async function check(acl, req, res, next) {
    try {
        const token = req.token;
        if (token) {
            const tempDecode = jwt.decode(token);
            const key = await keymanager.read(tempDecode.user._id);
            const verify = jwt.verify(token, key);
            if (!verify) {
                throw new errors.InvalidData({
                    message: 'JWT token is not valid'
                });
            }
            const {
                user
            } = verify;
            req.user = user;
            const roles = (user) ? user.roles : ['guest'];
            const result = await aclCheck(acl, roles, req.route.path, req.method.toLowerCase(), res, next);
            return result;
        } else {
            const roles = 'guest';
            const result = await aclCheck(acl, roles, req.route.path, req.method.toLowerCase(), res, next);
            return result;
        }
    } catch (e) {
        throw new errors.JwtExpired({
            message: 'JWT token is invalid or expired.'
        });
    }
}


module.exports = {
    check,
};
