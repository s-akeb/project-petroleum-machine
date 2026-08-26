const mongoose = require('mongoose');
const { fail } = require('../helper/apiResponse');

const PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    mobile: /^[6-9]\d{9}$/,
    countryCode: /^\+\d{1,4}$/,
    otp: /^\d{6}$/,
    pin: /^\d{6}$/,
    ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/i,
    name: /^[a-zA-Z][a-zA-Z .'-]{1,49}$/,
    objectId: /^[a-fA-F0-9]{24}$/,
};

const isEmpty = (value) => value === undefined || value === null || String(value).trim() === '';

const getValue = (req, field) => {
    if (req.body && req.body[field] !== undefined) return req.body[field];
    if (req.query && req.query[field] !== undefined) return req.query[field];
    if (req.params && req.params[field] !== undefined) return req.params[field];
    return undefined;
};

const setValue = (req, field, value) => {
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, field)) {
        req.body[field] = value;
        return;
    }
    if (req.query && Object.prototype.hasOwnProperty.call(req.query, field)) {
        req.query[field] = value;
    }
};

const checkRule = (field, value, rule, req) => {
    if (rule.optional && isEmpty(value)) return null;
    if (isEmpty(value)) return `${field} is required.`;

    const str = String(value).trim();

    switch (rule.type) {
        case 'name':
            if (!PATTERNS.name.test(str)) return `${field} must be 2-50 letters.`;
            break;
        case 'email':
            if (!PATTERNS.email.test(str)) return 'Enter a valid email address.';
            break;
        case 'password':
            if (rule.strength === false) break;
            if (!PATTERNS.password.test(str)) {
                return 'Password must be at least 8 characters and include uppercase, lowercase, and a number.';
            }
            break;
        case 'mobile':
            if (!PATTERNS.mobile.test(str)) return 'Mobile number must be a valid 10-digit Indian number.';
            break;
        case 'countryCode':
            if (!PATTERNS.countryCode.test(str)) return 'Country code must look like +91.';
            break;
        case 'otp':
            if (!PATTERNS.otp.test(str)) return 'OTP must be a 6-digit number.';
            break;
        case 'pin':
            if (!PATTERNS.pin.test(str)) return 'PIN must be a 6-digit number.';
            break;
        case 'ifsc':
            if (!PATTERNS.ifsc.test(str)) return 'IFSC must be 11 characters, e.g. SBIN0001234.';
            break;
        case 'objectId':
            if (!PATTERNS.objectId.test(str) || !mongoose.isValidObjectId(str)) {
                return `${field} must be a valid id.`;
            }
            break;
        case 'integer': {
            const num = Number(str);
            if (!Number.isInteger(num)) return `${field} must be a whole number.`;
            if (rule.min !== undefined && num < rule.min) return `${field} must be at least ${rule.min}.`;
            if (rule.max !== undefined && num > rule.max) return `${field} must be at most ${rule.max}.`;
            break;
        }
        case 'date':
            if (Number.isNaN(Date.parse(str))) return `${field} must be a valid date.`;
            break;
        case 'enum':
            if (!rule.values.includes(str)) return `${field} must be one of: ${rule.values.join(', ')}.`;
            break;
        case 'string':
            if (rule.min && str.length < rule.min) return `${field} must be at least ${rule.min} characters.`;
            if (rule.max && str.length > rule.max) return `${field} must be at most ${rule.max} characters.`;
            break;
        default:
            break;
    }

    if (rule.sameAs) {
        const other = getValue(req, rule.sameAs);
        if (String(other) !== String(value)) {
            return `${field} must match ${rule.sameAs}.`;
        }
    }
    if (rule.notSameAs) {
        const other = getValue(req, rule.notSameAs);
        if (String(other) === String(value)) {
            return `${field} must be different from ${rule.notSameAs}.`;
        }
    }
    return null;
};

const validate = (schema, options = {}) => (req, res, next) => {
    const errors = [];

    Object.entries(schema).forEach(([field, rule]) => {
        let value = getValue(req, field);
        if (!isEmpty(value) && typeof value === 'string') {
            value = rule.type === 'email' || rule.type === 'ifsc' ? value.trim().toLowerCase() : value.trim();
            if (rule.type === 'ifsc') value = value.toUpperCase();
            if (rule.type === 'email') value = value.toLowerCase();
            setValue(req, field, value);
        }
        const message = checkRule(field, value, rule, req);
        if (message) errors.push({ field, message });
    });

    if (options.requireFile) {
        const hasFile = Boolean(req.file) || (Array.isArray(req.files) && req.files.length > 0);
        if (!hasFile) {
            errors.push({ field: options.requireFile, message: `${options.requireFile} is required.` });
        }
    }

    if (options.requireOneOf) {
        const hasOne = options.requireOneOf.some((field) => !isEmpty(getValue(req, field)));
        if (!hasOne) {
            errors.push({
                field: options.requireOneOf.join('|'),
                message: `Provide one of: ${options.requireOneOf.join(', ')}.`,
            });
        }
    }

    if (errors.length) {
        return fail(res, 400, 'Validation failed.', errors);
    }
    return next();
};

module.exports = {
    signUp: validate({
        firstName: { type: 'name' },
        lastName: { type: 'name' },
        email: { type: 'email' },
        password: { type: 'password' },
        confirmPassword: { type: 'password', sameAs: 'password' },
        countryCode: { type: 'countryCode' },
        mobileNumber: { type: 'mobile' },
        address: { type: 'string', optional: true, max: 200 },
        dateOfBirth: { type: 'date', optional: true },
        street: { type: 'string', optional: true, max: 100 },
        area: { type: 'string', optional: true, max: 100 },
        city: { type: 'string', optional: true, max: 50 },
        state: { type: 'string', optional: true, max: 50 },
        country: { type: 'string', optional: true, max: 50 },
        pin: { type: 'pin', optional: true },
    }, { requireFile: 'image' }),

    otpVerify: validate({
        email: { type: 'email' },
        otp: { type: 'otp' },
    }),

    emailOnly: validate({
        email: { type: 'email' },
    }),

    resetPassword: validate({
        email: { type: 'email' },
        otp: { type: 'otp' },
        newPassword: { type: 'password' },
        confirmNewPassword: { type: 'password', sameAs: 'newPassword' },
    }),

    login: validate({
        email: { type: 'email' },
        password: { type: 'password', strength: false },
    }),

    editProfile: validate({
        firstName: { type: 'name', optional: true },
        lastName: { type: 'name', optional: true },
        countryCode: { type: 'countryCode', optional: true },
        mobileNumber: { type: 'mobile', optional: true },
        address: { type: 'string', optional: true, max: 200 },
        dateOfBirth: { type: 'date', optional: true },
        street: { type: 'string', optional: true, max: 100 },
        area: { type: 'string', optional: true, max: 100 },
        city: { type: 'string', optional: true, max: 50 },
        state: { type: 'string', optional: true, max: 50 },
        country: { type: 'string', optional: true, max: 50 },
        pin: { type: 'pin', optional: true },
        email: { type: 'email', optional: true },
    }),

    changePassword: validate({
        password: { type: 'password', strength: false },
        newPassword: { type: 'password', notSameAs: 'password' },
        confirmNewPassword: { type: 'password', sameAs: 'newPassword' },
    }),

    listQuery: validate({
        search: { type: 'string', optional: true, max: 80 },
        page: { type: 'integer', optional: true, min: 1, max: 1000 },
        limit: { type: 'integer', optional: true, min: 1, max: 100 },
        fromDate: { type: 'date', optional: true },
        toDate: { type: 'date', optional: true },
        nozzel: { type: 'integer', optional: true, min: 1, max: 4 },
    }),

    getIfsc: validate({
        ifscCode: { type: 'ifsc' },
    }),

    addMachine: validate({
        machineName: { type: 'string', min: 2, max: 80 },
        machineColor: { type: 'string', min: 2, max: 40 },
        machineType: { type: 'string', optional: true, max: 40 },
        machineCapacity: { type: 'string', min: 1, max: 40 },
        nozzel: { type: 'integer', min: 1, max: 4 },
        machineFuelType: { type: 'string', min: 2, max: 40 },
        machinePaymentMode: { type: 'string', optional: true, max: 40 },
    }),

    updateMachine: validate({
        _id: { type: 'objectId', optional: true },
        machineName: { type: 'string', optional: true, min: 2, max: 80 },
        machineColor: { type: 'string', optional: true, min: 2, max: 40 },
        machineType: { type: 'string', optional: true, max: 40 },
        machineCapacity: { type: 'string', optional: true, max: 40 },
        nozzel: { type: 'integer', optional: true, min: 1, max: 4 },
        machineFuelType: { type: 'string', optional: true, max: 40 },
        machinePaymentMode: { type: 'string', optional: true, max: 40 },
    }, { requireOneOf: ['_id', 'machineName'] }),

    deleteMachine: validate({
        _id: { type: 'objectId', optional: true },
        machineName: { type: 'string', optional: true, min: 2, max: 80 },
    }, { requireOneOf: ['_id', 'machineName'] }),

    viewStatic: validate({
        type: { type: 'enum', values: ['T&C', 'P&P', 'AboutUs'] },
    }),

    editStatic: validate({
        _id: { type: 'objectId' },
        type: { type: 'enum', optional: true, values: ['T&C', 'P&P', 'AboutUs'] },
        title: { type: 'string', optional: true, min: 2, max: 120 },
        description: { type: 'string', optional: true, min: 2, max: 5000 },
    }),
};
