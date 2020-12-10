'use strict';

module.exports = function(app) {
    // Root routing
    var core = require('../controllers/core');

    // Define application route
    app.route('/*').get(core.renderIndex);
};
