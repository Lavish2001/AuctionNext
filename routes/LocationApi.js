const express = require("express");
const router = express.Router();
const lcontroller = controller("Api/LocationController");
const loginAuth = middleware("loginAuth");




// LOCATION API ROUTES //



// SET COMPANY WITH LOCATION AND ADDRESS //

router.post('/create-location', loginAuth, (req, res) => {
    return lcontroller.createLocation(req, res);
});



// GET NEARBY COMPANIES //

router.get('/nearby-company', (req, res) => {
    return lcontroller.getNearby(req, res);
});




module.exports = router;
