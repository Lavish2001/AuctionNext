const express = require("express");
const router = express.Router();
const mcontroller = controller("Api/MessageController");
const loginAuth = middleware("loginAuth");




// SEND MESSAGE //

router.post('/send-message-task', loginAuth, (req, res) => {
    return mcontroller.sendMessage(req, res);
});




module.exports = router;
