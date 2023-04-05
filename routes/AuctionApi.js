const express = require("express");
const router = express.Router();
const acontroller = controller("Api/AuctionController");
const loginAuth = middleware("loginAuth");




// AUCTION EJS TEMPLATE ENGINE ROUTES //



// CREATE AUCTION //

router.get('/create_auction', async (req, res) => {
    return res.render('create-auction')
});



// JOIN AUCTION //

router.get('/join_auction', async (req, res) => {
    return res.render('join')
});




// LIVE AUCTION //

router.get('/live_auction', async (req, res) => {
    return res.render('live-auction')
});




/****************************************************************************************************************************************************************/





// AUCTION API ROUTES //



// CREATE AUCTION ITEM //

router.post('/create-auction', loginAuth, (req, res) => {
    return acontroller.createAuction(req, res);
});



// GET AUCTION ITEM WHICH IS AVAILABLE //

router.get('/get-auction-item', loginAuth, (req, res) => {
    return acontroller.getAuctionItem(req, res);
});



// UPDATE AUCTION ITEM  //

router.patch('/update-auction-item', loginAuth, (req, res) => {
    return acontroller.updateAuctionItem(req, res);
});





module.exports = router;
