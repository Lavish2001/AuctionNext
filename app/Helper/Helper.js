const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Nexmo = require('nexmo');
const { Verification } = model("");
const { Location } = model("");
const path = require('path');
const fs = require('fs');
const private_key = fs.readFileSync(path.join(__dirname, '../../Public/PrivateKey/private.key'));
const public_key = fs.readFileSync(path.join(__dirname, '../../Public/PublicKey/public.key'));
const axios = require('axios');
const { Sequelize } = require('../Models/index');

// const geolocation = require('node-geocoder');

// const options2 = {
//     provider: 'openstreetmap'
// };

// const geocoder = geolocation(options2);

// const address = 'Mohali / Chandigarh - 140308';

// geocoder.geocode(address)
//     .then((res) => {
//         console.log(res);
//     })
//     .catch((err) => {
//         console.log(err);
//     });


// FIND DIRECT DISTANCE BY AIR //

async function findNearbyCompanies(latitude, longitude) {
    const R = 6371; // Radius of the earth in km
    const distance = Sequelize.literal(`
      ${R} *
      acos(
        cos(radians(${latitude})) *
        cos(radians(latitude)) *
        cos(radians(longitude) - radians(${longitude})) +
        sin(radians(${latitude})) *
        sin(radians(latitude))
      )
    `);

    return distance;
};




// GET DISDTANCE BY ROAD //

async function getDistanceByRoad(startLat, startLon, endLat, endLon) {
    try {
        const apiKey = '5b3ce3597851110001cf6248dc78b050ba5f4435aa610960c2b1482c';
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startLon},${startLat}&end=${endLon},${endLat}`;
        const response = await axios.get(url);
        const distance = response.data.features[0].properties.segments[0].distance / 1000;
        return distance;
    } catch (error) {
        console.log(error);
    }
};


// getDistanceByRoad(30.70878, 76.83979, 30.65967, 76.82189); // Replace the coordinates with your own




async function repeatFunction(latitude, longitude, array) {
    const result = [];
    for (let x of array) {
        const data = await getDistanceByRoad(latitude, longitude, x.latitude, x.longitude);
        let obj = {
            company_name: x.company_name,
            company_address: x.company_address,
            distance: `${Math.floor(data)} KiloMetres approx...`
        };
        result.push(obj);
    };
    return result;

};




const nexmo = new Nexmo({
    apiKey: env('NEXMO_API_KEY'),
    apiSecret: env('NEXMO_SECRET_KEY'),
    applicationId: env('NEXMO_APPICATION_ID'),
    privateKey: private_key
});




// Generate Message and send it to the user's phone number

const sendVerificationCode = (phoneNumber) => {
    // const num = Math.floor(Math.random() * 999999);
    // const num2 = num.toString().slice(0, 4);
    // const otpCode = Number(num2);
    const msg = fs.readFileSync(text);
    const message = 'Greetings From Nexmo...'
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
    findNearbyCompanies,
    repeatFunction,
    storage,
    options
};