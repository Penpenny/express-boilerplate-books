/**
 * Module dependencies
 */
var acl = require('acl');
const aclCheck = require('../../../../utilities/acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke User Permissions
 */
exports.invokeRolesPolicies = function() {
    acl.allow([{
        roles: ['admin'],
        allows: [{
            resources: '/users/me',
            permissions: ['get']
        }, {
            resources: '/users',
            permissions: ['put']
        }, {
            resources: '/users/password',
            permissions: ['post']
        }, {
            resources: '/users/picture',
            permissions: ['post']
        }, {
            resources: '/users/picture',
            permissions: ['post']
        }, {
            resources: '/users/all',
            permissions: ['get']
        }, {
            resources: '/users/:username',
            permissions: ['get', 'put']
        }, {
            resources: '/users/lock/:username',
            permissions: ['put']
        }, {
            resources: '/users/dashboard/counts',
            permissions: ['get']
        }],
    }]);
};

/**
 * Check If User Policy Allows
 */
exports.isAllowed = async(req, res, next) => {
    await aclCheck.check(acl, req, res, next);
};
