const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please tell us your name'],
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true,
            validate: {
                validator: function (value) {
                    return validator.isEmail(value);
                },
                message: 'Please provide a valid email',
            },
        },
        photo: {
            type: String,
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 8,
        },
        passwordConfirm: {
            type: String,
            validate: {
                validator: function (value) {
                    return value === this.password;
                },
                message: ['Please Enter password again'],
            },
            required: [true, 'Please confirm your password'],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

module.exports = mongoose.model('User', userSchema);
