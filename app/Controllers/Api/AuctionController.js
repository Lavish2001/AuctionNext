const { User } = model("");
const { Item } = model("");
const { Auction } = model("");
const { Bid } = model("");
const { checkAdmin } = helper("Helper");
const { Op } = require("sequelize");

module.exports = class AuctionController {




    // CREATE AUCTION ITEM //

    async createAuction(req, res) {

        try {
            await checkAdmin(req.user, req, res);
            const findItem = await Item.findOne({ where: { item_id: req.body.item_id } });
            if (findItem) {
                const find = await Auction.findOne({ where: { item_id: findItem.id } });
                if (find) {
                    if (find.bidder_id === null) {
                        await find.update({
                            started_at: Date.now(),
                            ended_at: Date.now() + 1800000
                        });
                        return res.status(200).json({ 'status': 'success', 'message': 'Auction Started and ends in next 30 minutes' })
                    } else {
                        return res.status(400).json({ 'status': 'failed', 'message': 'Item Already Sold Out' })
                    }
                } else {
                    await Auction.create({
                        item_id: findItem.id,
                        bid_amount: findItem.base_price,
                        started_at: Date.now(),
                        ended_at: Date.now() + 1800000
                    });
                    return res.status(200).json({ 'status': 'success', 'message': 'Auction Started and ends in next 30 minutes' })
                }
            } else {
                return res.status(400).json({ 'status': 'failed', 'message': 'ERROR' })
            }
        } catch (err) {
            return res.status(500).json({ 'status': 'failed', 'message': err.message })
        }

    };




    // GET AUCTION ITEM //

    async getAuctionItem(req, res) {

        try {
            const auction_item = await Auction.findOne({
                where: { ended_at: { [Op.gt]: Date.now() } }, attributes: { exclude: ['createdAt', 'updatedAt'] }, include: [{
                    model: Item, as: 'Item', attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: Bid, as: 'Bidding', attributes: { exclude: ['createdAt', 'updatedAt'] }, include: {
                        model: User, as: 'Bidder', attributes: { exclude: ['createdAt', 'updatedAt', 'password', 'email', 'admin'] }
                    },
                    order: [['bid_amount', 'DESC']]
                }
                ]
            });
            if (auction_item) {
                const data = await Item.findOne({ where: { item_id: auction_item.item_id } });
                return res.status(200).json({ 'status': 'success', 'data': auction_item })
            } else {
                return res.status(400).json({ 'status': 'failed', 'message': 'No Live Auction available right now.' })
            }
        } catch (err) {
            return res.status(500).json({ 'status': 'failed', 'message': err.message })
        }

    };




    // UPDATE AUCTION ITEM //

    async updateAuctionItem(req, res) {
        try {
            const { id, bid } = req.body;
            const auction = await Auction.findOne({ where: { id: id } });
            if (Number(bid) <= Number(auction.bid_amount)) {
                return res.status(400).json({ 'status': 'failed', 'message': 'Increase Bid Amount' })
            } else {
                const checkHignestBid = await Bid.findOne({
                    order: [['bid_amount', 'DESC']]
                });
                if (checkHignestBid && req.user.id === checkHignestBid.bidder_id) {
                    return res.status(400).json({ 'status': 'failed', 'message': 'You have highest bid right now' })
                } else {
                    if (checkHignestBid && Number(bid) <= Number(checkHignestBid.bid_amount)) {
                        return res.status(400).json({ 'status': 'failed', 'message': 'Increase Bid Amount' })
                    } else {
                        const find = await Bid.findOne({ where: { [Op.and]: { auction_id: auction.id, bidder_id: req.user.id } } });
                        if (find) {
                            await find.update({
                                bid_amount: bid
                            });
                            await auction.update({
                                bidder_id: req.user.id
                            });
                            return res.status(200).json({ 'status': 'success', 'message': 'Bid Submit Successfully' })
                        } else {
                            await Bid.create({
                                auction_id: auction.id,
                                bidder_id: req.user.id,
                                bid_amount: bid
                            });
                            await auction.update({
                                bidder_id: req.user.id
                            });
                            return res.status(200).json({ 'status': 'success', 'message': 'Bid Submit Successfully' })
                        }
                    }
                }
            }
        } catch (err) {
            return res.status(500).json({ 'status': 'failed', 'message': err.message })
        }

    };






};
