/**
 * Module dependencies
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const validator = require('validator');
const generatePassword = require('generate-password');
const owasp = require('owasp-password-strength-test');
const phone = require('phone');

const config = require('../../../../config/config');
owasp.config(config.shared.owasp);

/**
 * A Validation function for local strategy email
 */
var validateLocalStrategyEmail = email => {
    return (
        (this.provider !== 'local' && !this.updated) ||
        validator.isEmail(email, {
            require_tld: false
        })
    );
};

/**
 * A Validation function for phone number
 */

var validateMobile = mobile => {
    return phone(mobile).length > 0;
};

/**
 * A Validation function for username
 * - at least 3 characters
 * - only a-z0-9_-.
 * - contain at least one alphanumeric character
 * - not in list of illegal usernames
 * - no consecutive dots: "." ok, ".." nope
 * - not begin or end with "."
 */

var validateUsername = username => {
    return (
        this.provider !== 'local' ||
        (username && config.illegalUsernames.indexOf(username) < 0)
    );
};

/**
 * User Schema
 */
var UserSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        default: ''
    },
    lastName: {
        type: String,
        trim: true,
        default: ''
    },
    displayName: {
        type: String,
        trim: true,
        es_indexed: true
    },
    email: {
        type: String,
        index: {
            unique: true,
            sparse: true // For this to work on a previously indexed field, the index must be dropped & the application restarted.
        },
        lowercase: true,
        trim: true,
        verified: false,
        default: '',
        validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
    },
    username: {
        type: String,
        unique: 'Username already exists',
        validate: [
            validateUsername,
            'Please enter a valid username: 3+ characters long, non restricted word, characters "_-.", no consecutive dots, does not begin or end with dots, letters a-z and numbers 0-9.'
        ],
        lowercase: true,
        trim: true,
        es_indexed: true
    },
    password: {
        type: String,
        default: ''
    },
    lockDetails: {
        type: String
    },
    salt: {
        type: String
    },
    profileImageURL: {
        type: String,
        default: 'https://s3.amazonaws.com/assets.penpenny.com/profile-placeholder.png'
    },
    roles: {
        type: [{
            type: String,
            enum: ['user', 'admin']
        }],
        default: ['user'],
        required: 'Please provide at least one role'
    },
    provider: {
        type: String,
        required: 'Provider is required'
    },
    providerData: {},
    additionalProvidersData: {},
    timezone: {
        type: String,
        default: 'UTC +0'
    },
    mobile: {
        type: String,
        validate: [validateMobile, 'Please enter a valid mobile number']
    },
    preferredTopics: {
        type: Array
    },
    lock: {
        type: Boolean,
        default: false // true-lock  false-unlock
    },
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    },
    /* For reset password */
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
    if (this.password && this.isModified('password')) {
        this.salt = crypto.randomBytes(16).toString('base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

/**
 * Hook a pre validate method to test the local password
 */
UserSchema.pre('validate', function(next) {
    if (
        this.provider === 'local' &&
        this.password &&
        this.isModified('password')
    ) {
        var result = owasp.test(this.password);
        if (result.errors.length) {
            var error = result.errors.join(' ');
            this.invalidate('password', error);
        }
    }

    next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
    if (this.salt && password) {
        return crypto
            .pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64, 'SHA1')
            .toString('base64');
    } else {
        return password;
    }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
};

/**
 * Generates a random passphrase that passes the owasp test
 * Returns a promise that resolves with the generated passphrase, or rejects with an error if something goes wrong.
 * NOTE: Passphrases are only tested against the required owasp strength tests, and not the optional tests.
 */
UserSchema.statics.generateRandomPassphrase = function() {
    return new Promise(function(resolve, reject) {
        var password = '';
        var repeatingCharacters = new RegExp('(.)\\1{2,}', 'g');

        // iterate until the we have a valid passphrase
        // NOTE: Should rarely iterate more than once, but we need this to ensure no repeating characters are present
        while (password.length < 20 || repeatingCharacters.test(password)) {
            // build the random password
            password = generatePassword.generate({
                length: Math.floor(Math.random() * 20) + 20, // randomize length between 20 and 40 characters
                numbers: true,
                symbols: false,
                uppercase: true,
                excludeSimilarCharacters: true
            });

            // check if we need to remove any repeating characters
            password = password.replace(repeatingCharacters, '');
        }

        // Send the rejection back if the passphrase fails to pass the strength test
        if (owasp.test(password).errors.length) {
            reject(
                new Error(
                    'An unexpected problem occured while generating the random passphrase'
                )
            );
        } else {
            // resolve with the validated passphrase
            resolve(password);
        }
    });
};

mongoose.model('User', UserSchema);
