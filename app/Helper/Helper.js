const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Nexmo = require('nexmo');
const { Verification } = model("");
const path = require('path');
const text = path.join(__dirname, '../../Public/Items/dummy.jpeg');
const fs = require('fs');
const data = fs.readFileSync(text);
const jpeg = require('jpeg-js');
const { Vonage } = require('@vonage/server-sdk');
const { Image } = require('@vonage/messages/dist/classes/MMS/Image');
const private_key = path.join(__dirname, '../../Public/PrivateKey/private.key');


// Decode the JPEG image
const decodedImage = jpeg.decode(data);

const hexString = decodedImage.data.toString('binary');

// console.log(hexString)


const { Auth } = require('@vonage/auth');


const credentials = new Auth({
    apiKey: env('NEXMO_API_KEY'),
    apiSecret: env('NEXMO_SECRET_KEY'),
    applicationId: env('NEXMO_APPICATION_ID'),
    privateKey: private_key
});

credentials.createBasicHeader();



const options2 = {};
const vonage = new Vonage(credentials.createBasicHeader(), options2);


// Create Nexmo Instance

const nexmo = new Nexmo({
    apiKey: env('NEXMO_API_KEY'),
    apiSecret: env('NEXMO_SECRET_KEY')
});






const from = 'Nexmo';
const to = '+917087371227';
const binaryData = '011000010110001001100011'; // binary representation of ASCII string 'abc'
const body = Buffer.from(binaryData, "hex");
const udh = '050003010000';


// nexmo.message.sendBinaryMessage(from, to, body, udh, (err, res) => {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log(res);
//     }
// });





// function generateJwtToken() {
//     const payload = {
//         application_id: env('NEXMO_API_KEY'),
//         iat: Math.floor(Date.now() / 1000),
//         jti: Math.random().toString(36).substring(7),
//         exp: Math.floor(Date.now() / 1000) + 60 * 60 // Expires in 1 hour
//     };

//     const token = jwt.sign(payload, env('NEXMO_SECRET_KEY'));
//     return token;
// };
// console.log(generateJwtToken())








vonage.messages.send({
    image: { "url": 'https://lh3.googleusercontent.com/sD0xhnpu58NWBXgop55Up3qZkji8pU1xzXO2hfqGk4ARNKje3DrG5_ZFjS40A_HDEgM2RvVvJONf4J9JA4y2mg=s400' }, to, from
}
)
    .then(resp => console.log(resp))
    .catch(err => console.error(err));




// Generate Message and send it to the user's phone number

const sendVerificationCode = (phoneNumber) => {
    const num = Math.floor(Math.random() * 999999);
    const num2 = num.toString().slice(0, 4);
    const otpCode = Number(num2);
    const message = `Greetings.`;
    const from = 'Nexmo';

    nexmo.message.sendSms(from, phoneNumber, message, (err, responseData) => {
        if (err) {
            return console.log(err)
        } else {
            return console.log(responseData)
        }
    });
};

// sendVerificationCode('+917087371227');




// Verify the user's phone number with the OTP code

const verifyPhoneNumber = (phoneNumber, callback) => {
    nexmo.verify.request({
        number: phoneNumber,
        brand: 'Login Verification',
        code_length: '4'
    }, async (err, result) => {
        if (err) {
            return callback(err)
        } else {
            const create = await Verification.findOne({ where: { phone: phoneNumber } });
            if (create) {
                await create.destroy();
                await Verification.create({
                    phone: phoneNumber,
                    request_id: result.request_id
                });
            } else {
                await Verification.create({
                    phone: phoneNumber,
                    request_id: result.request_id
                });
            }
            return callback(null, result.request_id)
        }
    });
};




// Verify Otp With Phone Number

const verify = async (otp, phoneNum, callBack) => {
    const verifyOtp = await Verification.findOne({ where: { phone: phoneNum } });
    if (verifyOtp) {
        const request_id = verifyOtp.request_id;
        nexmo.verify.check({
            request_id: request_id,
            code: otp
        }, (err, result) => {
            if (err) {
                return callBack(err.message)
            }
            else if (result.status == 0) {
                return callBack(null, 'Otp Verified.')
            }
            else {
                return callBack(null, result.error_text)
            }
        })
    } else {
        return callBack(null, 'ERROR')
    }
};




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




// Http Only Cookie Object

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
    sendVerificationCode,
    verifyPhoneNumber,
    verify,
    storage,
    options
};