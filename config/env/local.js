const path = require('path');
var defaultEnvConfig = require('./default');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), './.env') });

module.exports = {
    db: {
        uri: process.env.MONGOHQ_URL || process.env.MONGODB_URI || 
        'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + ('/' + process.env.DB_NAME ) 
        || '/boilerplate',
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
        title: defaultEnvConfig.app.title + ' - ' + (process.env.ENVIRONMENT || 'Development' ) + ' Environment',
        url: process.env.API_URL ||  'https://dev-api.boilerplate.xyz',
    },
    jwt: {
        expiresIn: process.env.JWT_EXPIRES_IN='15d',
        refreshTokenExpiresIN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN='2d',
    },
    invite: {
        expiresIn: 3600000
    },
    clientApps: {
        url: process.env.CLIENT_APP || 'http://dev-app.boilerplate.xyz',
    },
};
