const express = require("express");
const router = express.Router();
const icontroller = controller("Api/ItemController");
const loginAuth = middleware("loginAuth");




// ITEM EJS TEMPLATE ENGINE ROUTES //



// CREATE AUCTION ITEM //

router.get('/create_auction_item', async (req, res) => {
    return res.render('create-item')
});



/****************************************************************************************************************************************************************/



// ITEM API ROUTES //



// CREATE AUCTION ITEM //

router.post('/create-item', loginAuth, (req, res) => {
    return icontroller.createItem(req, res);
});



// GET ALL AUCTION ITEM WITH PAGINATION //

router.get('/get-all-items', loginAuth, (req, res) => {
    return icontroller.getAllItem(req, res);
});




// GET ALL AUCTION ITEM //

router.get('/get-all-items-once', loginAuth, (req, res) => {
    return icontroller.getAllItemOnce(req, res);
});





module.exports = router;
