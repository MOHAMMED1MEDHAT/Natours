const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

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
        role: {
            type: String,
            enum: ['user', 'guide', 'lead-guide', 'admin'],
            default: 'user',
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
        passwordChangedAt: Date,
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});
//instance method
userSchema.methods.correctPassword = async function (inPswd, realPswd) {
    return await bcrypt.compare(inPswd, realPswd);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimeStamp < changedTimeStamp;
    }

    return false;
};

module.exports = mongoose.model('User', userSchema);
