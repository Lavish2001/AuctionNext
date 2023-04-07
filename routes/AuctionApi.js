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



// AUCTION RESULTS //

router.get('/results', async (req, res) => {
    return res.render('results')
});




/****************************************************************************************************************************************************************/




// AUCTION API ROUTES //



// CREATE AUCTION ITEM //

router.post('/create-auction', loginAuth, (req, res) => {
    return acontroller.createAuction(req, res);
});



// GET LIVE AUCTION ITEM WHICH IS AVAILABLE //

router.get('/get-auction-item', loginAuth, (req, res) => {
    return acontroller.getAuctionItem(req, res);
});



// UPDATE AUCTION ITEM  //

router.patch('/update-auction-item', loginAuth, (req, res) => {
    return acontroller.updateAuctionItem(req, res);
});



// GET SINGLE AUCTION ITEM //

router.get('/get-single-auction-item', loginAuth, (req, res) => {
    return acontroller.getAuctionItemSingle(req, res);
});




// SEND MESSAGE  //

router.post('/send-message', loginAuth, (req, res) => {
    return acontroller.sendMessage(req, res);
});




// CREATE AUCTION RESULT PDF  //

router.post('/create-pdf', loginAuth, (req, res) => {
    return acontroller.result(req, res);
});





module.exports = router;
