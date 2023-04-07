const { User } = model("");
const { Item } = model("");
const { Chat } = model("");
const { Auction } = model("");
const { Bid } = model("");
const { checkAdmin } = helper("Helper");
const { Op } = require("sequelize");
const pdf = require('pdfkit');
const fs = require('fs');
const path = require('path');
const pdfSavePath = path.join(__dirname, '../../../Public/Pdf');
const pdfImagePath = path.join(__dirname, '../../../Public/Items');




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
                        await Chat.destroy({ where: { auction_id: find.id } });
                        if (find.ended_at < Date.now()) {
                            await find.update({
                                started_at: Date.now(),
                                ended_at: Date.now() + 10000
                            });
                            return res.status(200).json({ 'status': 'success', 'message': 'Auction Started and ends in next 30 minutes' })
                        } else {
                            return res.status(400).json({ 'status': 'failed', 'message': 'Item Already in Live Auction' })
                        }
                    } else {
                        return res.status(400).json({ 'status': 'failed', 'message': 'Item Already Sold Out' })
                    }
                } else {
                    await Auction.create({
                        item_id: findItem.id,
                        bid_amount: findItem.base_price,
                        started_at: Date.now(),
                        ended_at: Date.now() + 10000
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




    // GET LIVE AUCTION ITEM //

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
                },
                {
                    model: Chat, as: 'Chat', include: {
                        model: User, as: 'sender', attributes: { exclude: ['createdAt', 'updatedAt', 'password', 'email', 'admin'] }
                    }
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
            const auction = await Auction.findOne({ where: { [Op.and]: { id: id, ended_at: { [Op.gt]: Date.now() } } } });
            console.log(auction)
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




    // GET SINGLE AUCTION ITEM //

    async getAuctionItemSingle(req, res) {
        console.log(req.query)
        try {
            const { id } = req.query;
            const auction_item = await Auction.findOne({
                where: { id: id }, attributes: { exclude: ['createdAt', 'updatedAt'] }, include: [{
                    model: Item, as: 'Item', attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: Bid, as: 'Bidding', order: [['bid_amount', 'DESC']], limit: 1, attributes: { exclude: ['createdAt', 'updatedAt'] }, include: {
                        model: User, as: 'Bidder', attributes: { exclude: ['createdAt', 'updatedAt', 'password', 'email', 'admin'] }
                    }
                }]
            });
            if (auction_item) {
                return res.status(200).json({ 'status': 'success', 'data': auction_item })
            } else {
                return res.status(400).json({ 'status': 'failed', 'message': 'ERROR' })
            }
        } catch (err) {
            return res.status(500).json({ 'status': 'failed', 'message': err.message })
        }

    };




    // SEND MESSAGE //

    async sendMessage(req, res) {
        try {
            const { id, text } = req.body;
            if (id, text) {
                await Chat.create({
                    user_id: req.user.id,
                    auction_id: id,
                    text: text
                });
                return res.status(200).json({ 'status': 'success', 'message': 'messsage send successfully' })
            } else {
                return res.status(400).json({ 'status': 'failed', 'message': 'message cannot be empty' })
            }
        } catch (err) {
            return res.status(500).json({ 'status': 'failed', 'message': err.message })
        }
    };




    // CREATE AUCTION RESULT PDF //

    async result(req, res) {
        try {

            const { id } = req.body;
            const auction = await Auction.findOne({
                where: { [Op.and]: { id: id, bidder_id: { [Op.ne]: null } } }, include: [{
                    model: Item, as: 'Item', attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                {
                    model: Bid, as: 'Bidding', order: [['bid_amount', 'DESC']], limit: 1, attributes: { exclude: ['createdAt', 'updatedAt'] }, include: {
                        model: User, as: 'Bidder', attributes: { exclude: ['createdAt', 'updatedAt', 'password', 'email', 'admin'] }
                    }
                }]
            });

            if (auction) {
                const myPath = path.join(pdfSavePath, `${auction.id}-${Date.now()}.pdf`)

                const doc = new pdf();
                doc.pipe(fs.createWriteStream(myPath));

                // pdf heading

                doc.fontSize(16).text('Auction Result', { align: 'center', underline: true }).moveDown(2);

                // pdf item image

                doc.image(`${pdfImagePath}/${auction.Item.image}`, {
                    width: 300,
                    height: 300,
                    align: 'center',
                    valign: 'center',
                    fit: [250, 300]
                }).moveDown(2);

                doc.fontSize(12).text(`Item Name: ${auction.Item.item_name}`).moveDown();
                doc.fontSize(12).text(`Description: ${auction.Item.description}`).moveDown();
                doc.fontSize(12).text(`Base Price: ${auction.Item.base_price}`).moveDown();
                doc.fontSize(12).text(`Highest Bid: ${auction.Bidding.length ? auction.Bidding[0].bid_amount : 0}$`).moveDown();
                doc.fontSize(12).text(`Sold To: ${auction.Bidding.length ? auction.Bidding[0].Bidder.username : `Unsold`}`).moveDown();
                doc.fontSize(12).text(`Started At: ${new Date(auction.started_at).toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: 'numeric' })}`).moveDown();
                doc.fontSize(12).text(`Closes At: ${new Date(auction.ended_at).toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: 'numeric' })}`).moveDown();

                doc.end();

                // Wait for the PDF to finish writing before sending the response
                await new Promise(resolve => {
                    doc.on('end', resolve);
                });

                return res.status(200).json({ 'status': 'success', 'message': 'pdf generated successfully' });
            } else {
                return res.status(400).json({ 'status': 'failed', 'message': 'Item Unsold' });
            }
        } catch (err) {
            return res.status(500).json({ 'status': 'failed', 'message': err.message });
        }
    };




};
