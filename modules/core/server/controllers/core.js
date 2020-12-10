'use strict';

/**
 * Render the main application page
 */
exports.renderIndex = function(req, res) {
    res.jsonp({
        message: 'boilerplate!'
    });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function(req, res) {
    res.status(404).send({
        message: 'path not found'
    });
};
