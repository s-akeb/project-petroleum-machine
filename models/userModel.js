const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const mongoosePaginate = require('mongoose-paginate');
const userSchema = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    mobileNumber: {
        type: String
    },
    countryCode: {
        type: String
    },
    password: {
        type: String
    },
    profilePic: {
        type: String
    },
    address: {
        type: String
    },
    dateOfBirth: {
        type: String
    },
    otp: {
        type: String
    },
    otpExpireTime: {
        type: Number,
        allowNull: true
    },
    otpVerify: {
        type: Boolean,
        default: false
    },
    addressId: {
        type: Schema.Types.ObjectId,
        ref: 'address'
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
    userType: {
        type: String,
        enum: ["ADMIN", "USER"],
        default: "USER"
    }
},
    { timestamps: true }
);
userSchema.plugin(mongoosePaginate);
let userModel = mongoose.model("user", userSchema);
module.exports = userModel;

//Default Admin created:
userModel.findOne(
    { status: { $ne: "DELETE" }, userType: "ADMIN" },
    (userErr, userRes) => {
        if (userErr) {
            console.log("Default Admin side error:", userErr);
        } else if (userRes) {
            console.log("Default admin already exist");
        } else {
            let admin = {
                firstName: "Sakeb",
                lastName: "Ahmad",
                email: "no-sake@indicchain.com",
                mobileNumber: "82943394429",
                countryCode: "+91",
                password: bcrypt.hashSync("S1234"),
                userType: "ADMIN",
                otpVerify: true,
            };
            userModel(admin).save((saveErr, saveAdmin) => {
                if (saveErr) {
                    console.log("Default admin creation error", saveErr);
                } else {
                    console.log("Default admin created");
                }
            });
        }
    }
);
