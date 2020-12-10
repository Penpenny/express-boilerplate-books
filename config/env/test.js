var defaultEnvConfig = require('./default');

module.exports = {
    db: {
        uri: process.env.MONGOHQ_URL || process.env.MONGODB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/boilerplatetest',
        options: {},
        // Enable mongoose debug mode
        debug: process.env.MONGODB_DEBUG || false
    },
    log: {
        // logging with Morgan - https://github.com/expressjs/morgan
        // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
        format: 'dev',
        fileLogger: {
            directoryPath: process.cwd(),
            fileName: 'app.log',
            maxsize: 10485760,
            maxFiles: 2,
            json: true
        }
    },
    app: {
        title: defaultEnvConfig.app.title + ' - Development Environment',
        url: 'http://localhost:3011'
    },
    jwt: {
        expiresIn: '15d',
        refreshTokenExpiresIN: '2d'
    },
    invite: {
        expiresIn: 3600000
    },
    clientApps: {
        url: 'http://dev-app.boilerplate.xyz'
    },
};
