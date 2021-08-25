const mongoose = require('mongoose');
const validator = require('validator');
const bctypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name.']
    },
    email: {
        type: String,
        required: [true, 'Please enter your emial'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please neter a valied email.']

    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same'
        },

    },

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bctypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    next()

})

const User = mongoose.model('User', userSchema);

module.exports = User;