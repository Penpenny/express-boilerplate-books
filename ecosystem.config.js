module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [{
        name: 'dev-boilerplate', // dev application
        script: 'npm',
        args: 'run dev'
    }, {
        name: 'qa-boilerplate', // QA application
        script: 'npm',
        args: 'run qa'
    }, {
        name: 'staging-boilerplate', // staging application
        script: 'npm',
        args: 'run staging'
    }, {
        name: 'prod-boilerplate', // prod application
        script: 'npm',
        args: 'run prod'
    }],
};
