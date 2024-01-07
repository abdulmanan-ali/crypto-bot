const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { query } = require('express');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        requied: [true, "Please tell us your name"]
    },
    email: {
        type: String,
        required: [true, "Please provide us your email"],
        unique: true,
        lowercase: true,
    },
    membershipType: {
        type: String,
        lowercase: true,
        default: "notMember"
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please provide your password"]
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please provide your password"],
        validate: {
            validator: function (el) {
                return el === (this.password);
            },
            message: "message are not the same"
        }
    }
});

userSchema.pre("save", async (next) => {
    // only run this function if the password was actually modified
    if (!this.isModified("password")) return next();

    // has the password with the cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //Delete password confirm field
    this.passwordConfirm = undefined;
    next()
});

userSchema.pre("save", (next) => {
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangeAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, (next) => {
    // This points to the currect query
    this.find({ active: { $ne: false } });
    next();
})

userSchema.methods.correctPassword = async (candidatePassword, userPassword) => {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.passwordChangeAfter = (JWTTimestamp) => {
    if (this.passwordChangeAt) {
        const changeTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
        return JWTTimestamp < changeTimestamp;
    }
    // False means not change
    return false;
}


const User = mongoose.model("User", userSchema);

module.exports = User;