'use strict';

module.exports = {
    app: {
        title: 'express-boilerplate',
        description: 'express boilerplate',
        keywords: 'express boilerplate',
    },
    db: {
        promise: global.Promise
    },
    port: process.env.PORT || 3012,
    host: process.env.HOST || '0.0.0.0',
    domain: process.env.DOMAIN,
    illegalUsernames: ['meanjs', 'administrator', 'password', 'admin', 'user',
        'unknown', 'anonymous', 'null', 'undefined', 'api'
    ],
    // Lusca config
    csrf: {
        csrf: false,
        csp: false,
        xframe: 'SAMEORIGIN',
        p3p: 'fjaisfaie89(*jdinkiermjosjojreljs&*23400HJN^(0sn',
        xssProtection: true
    },
    aws: {
        s3: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            bucket: process.env.S3_BUCKET
        }
    },
    shared: {
        owasp: {
            allowPassphrases: true,
            maxLength: 128,
            minLength: 10,
            minPhraseLength: 20,
            minOptionalTestsToPass: 4
        }
    }

};
