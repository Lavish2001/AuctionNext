const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');




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




module.exports = {
    HashPassword,
    passwordCheck,
    assignToken,
    compare,
    options
};
