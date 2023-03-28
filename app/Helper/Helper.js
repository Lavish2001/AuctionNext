const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { User } = model("");




// HASH PASSWORD //

const HashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    return hashPassword;
};




// CHECK PASSWORD CONTAIN ALTEST 2 NUMBER

const passwordCheck = async (password) => {
    var num = 0;
    for (let i = 0; i < password.length; i++) {
        if (password[i].match(/[0-9]/g))
            num++;
    };
    if (num >= 2) {
        return;
        // code return to signupFunction

    } else { throw new Error('password atleast contain two numbers'); }
};




// ASSIGN USER JWT TOKEN ON SIGNUP OR LOGIN

const assignToken = async (id) => {
    const token = await jwt.sign({ userId: id }, env('JWT_SECRET_KEY'));
    return token;
};




// COMPARE BCRYPT PASSWORD

const compare = async (req, res, notHash, hash) => {
    const checkPassword = await bcrypt.compare(notHash, hash);
    if (!checkPassword) {
        throw new Error('incorrect password');
    } else {
        return;
        // code return to loginFunction
    }
};

const options = {
    maxAge: 604800000,
    httpOnly: true
};



// CHECK USER IS ADMIN OR NOT //

const checkAdmin = async (user, req, res) => {
    if (user.admin === true) {
        return;
        // code return to mainFunction
    } else {
        throw new Error('You are not admin')
    };
};




// CONFIGURE STORE //

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Items');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname.split('.')[0] + '-' + Date.now() + '.' + file.mimetype.split('/')[1])
    }
});



// MIDDLEWARE UPLOAD FUNCTION //

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 100, fieldNameSize: 100 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            return cb(new Error('Only jpg, png and jpeg formats are allowed!'));
        }
    }
}).single('image');




module.exports = {
    HashPassword,
    passwordCheck,
    assignToken,
    compare,
    upload,
    checkAdmin,
    storage,
    options
};