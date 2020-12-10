const mongoose = require('mongoose');
const { Schema } = mongoose;

const KeySchema = new Schema({
    key: {
        type: String,
        required: 'true',
    },
    user: {
        type: Schema.ObjectId,
        refer: 'User',
        unique: true,
    },
    updated: {
        type: Date,
    },
    created: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Key', KeySchema);
