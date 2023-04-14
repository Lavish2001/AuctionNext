const express = require("express");
const router = express.Router();
const ucontroller = controller("Api/UserController");
const loginAuth = middleware("loginAuth");




// USER EJS TEMPLATE ENGINE ROUTES //



// LOGIN OR SIGNUP //

router.get('/', async (req, res) => {
  return res.render('start')
});



// USER LOGIN //

router.get('/user_login', async (req, res) => {
  return res.render('login')
});



// USER SIGNUP //

router.get('/user_signup', async (req, res) => {
  return res.render('signup')
});




// AFTER LOGIN WELCOME PAGE //

router.get('/welcome', async (req, res) => {
  return res.render('welcome')
});



// CHANGE PASSWORD //

router.get('/change_password', async (req, res) => {
  return res.render('change-password')
});



// CHANGE LANGUAGE //

router.get('/change_language', async (req, res) => {
  return res.render('change-language')
});




/****************************************************************************************************************************************************************/


// USER API ROUTES //



// USER SIGNUP //

router.post('/user-signup', (req, res) => {
  return ucontroller.userSignup(req, res);
});



// USER LOGIN //

router.post('/user-login', (req, res) => {
  return ucontroller.userLogin(req, res);
});



// USER LOGOUT //

router.delete('/user-logout', loginAuth, (req, res) => {
  return ucontroller.userLogout(req, res);
});



// DEACTIVATE ACCOUNT //

router.delete('/user-deactivate', loginAuth, (req, res) => {
  return ucontroller.deactivate(req, res);
});



// LOGIN COUNT //

router.get('/user-login-count', loginAuth, (req, res) => {
  return ucontroller.loginCount(req, res);
});



// CHANGE USER PASSWORD //

router.patch('/change-user-password', loginAuth, (req, res) => {
  return ucontroller.changePassword(req, res);
});



// LOGOUT FROM ANOTHER DEVICES //

router.delete('/logout-other-devices', loginAuth, (req, res) => {
  return ucontroller.logoutOtherDevices(req, res);
});



// SINGLE USER DETAILS //

router.get('/details', loginAuth, (req, res) => {
  return ucontroller.details(req, res);
});



// LOGIN WITH PHONE NUMBER //

router.post('/login-with-phone', loginAuth, (req, res) => {
  return ucontroller.otpVerify(req, res);
});





router.post('/webhooks', (req, res) => {
  console.log(req)
});






module.exports = router;
