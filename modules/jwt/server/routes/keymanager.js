const keymanager = require('../controllers/keymanager');

module.exports = function(app) {
    app.route('/create', keymanager.create);
    app.route('/read', keymanager.read);
    app.route('/update', keymanager.update);
    app.route('/remove/:user', keymanager.remove);
};
