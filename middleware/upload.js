const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { fail } = require('../helper/apiResponse');

const uploadDir = path.join(__dirname, '..', 'imageUpload');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const safeName = file.originalname.replace(/[^\w.\-]/g, '_');
        cb(null, `${unique}-${safeName}`);
    },
});

const fileFilter = (_req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
        const err = new Error('Only jpg, jpeg, png and webp images are allowed.');
        err.code = 'INVALID_FILE_TYPE';
        return cb(err);
    }
    cb(null, true);
};

const multerUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024, files: 15 },
});

const wrap = (middleware) => (req, res, next) => {
    middleware(req, res, (err) => {
        if (!err) return next();
        if (err.code === 'LIMIT_FILE_SIZE') {
            return fail(res, 400, 'Image size must be 5MB or less.');
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return fail(res, 400, 'Too many images. Maximum is 15.');
        }
        if (err.code === 'INVALID_FILE_TYPE') {
            return fail(res, 400, err.message);
        }
        return fail(res, 400, err.message || 'Invalid file upload.');
    });
};

module.exports = {
    single: (field) => wrap(multerUpload.single(field)),
    array: (field, max) => wrap(multerUpload.array(field, max)),
};
