const express = require("express");
const router = express.Router();
const ucontroller = controller("Api/UserController");
const loginAuth = middleware("loginAuth");



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



module.exports = router;
