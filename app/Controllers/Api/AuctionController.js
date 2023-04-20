const { User, Item, Chat, Auction, Bid } = model("");
const { checkAdmin } = helper("Helper");
const { Op } = require("sequelize");
const fs = require('fs');
const pdf = require('pdfkit');
const path = require('path');
const CronJob = require('cron').CronJob;
const pdfSavePath = path.join(__dirname, '../../../Public/Pdf');
const pdfImagePath = path.join(__dirname, '../../../Public/Items');


var job = new CronJob(
    '* * * * * *',
    async function () {
        const auction = await Auction.findOne({
            where: { [Op.and]: { ended_at: { [Op.lte]: Date.now() }, bidder_id: { [Op.ne]: null }, id: job.id } },
            include: [{
                model: Item, as: 'Item', attributes: { exclude: ['createdAt', 'updatedAt'] }
            },
            {
                model: Bid, as: 'Bidding', order: [['bid_amount', 'DESC']], limit: 1, attributes: { exclude: ['createdAt', 'updatedAt'] }, include: {
                    model: User, as: 'Bidder', attributes: { exclude: ['createdAt', 'updatedAt', 'password', 'email', 'admin'] }
                }
            }]
        });

        if (auction) {
            const myPath = path.join(pdfSavePath, `${auction.id}.pdf`);

            const doc = new pdf();
            // const create = new Table();
            doc.pipe(fs.createWriteStream(myPath));

            // pdf heading

            doc.fontSize(14).text('Auction Result', { align: 'center', underline: true }).moveDown(2);


            // Pdf Item Image

            const imageWidth = 180;
            const imageHeight = 150;
            const x = (doc.page.width - imageWidth) / 2;
            const y = doc.y;
            doc.image(`${pdfImagePath}/${auction.Item.image}`, {
                width: imageWidth,
                height: imageHeight,
                align: 'center',
                valign: 'center',
                cover: false,
                x: x,
                y: y,
            })
                .moveDown(2);

            doc.fontSize(10).text(`Item Name: ${auction.Item.item_name}`, { align: 'center' }).moveDown();
            doc.fontSize(10).text(`Description: ${auction.Item.description}`, { align: 'center' }).moveDown();
            doc.fontSize(10).text(`Base Price: ${auction.Item.base_price} $`, { align: 'center' }).moveDown();
            doc.fontSize(10).text(`Highest Bid: ${auction.Bidding.length ? auction.Bidding[0].bid_amount : 0} $`, { align: 'center' }).moveDown();
            doc.fontSize(10).text(`Sold To: ${auction.Bidding.length ? auction.Bidding[0].Bidder.username : `Unsold`}`, { align: 'center' }).moveDown();
            doc.fontSize(10).text(`Started At: ${new Date(auction.started_at).toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: 'numeric' })}`, { align: 'center' }).moveDown();
            doc.fontSize(10).text(`Closes At: ${new Date(auction.ended_at).toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: 'numeric' })}`, { align: 'center' }).moveDown();

            doc.addPage();

            const details = await Bid.findAll({
                where: { auction_id: auction.id }, order: [['bid_amount', 'DESC']], attributes: { exclude: ['createdAt', 'updatedAt', 'auction_id'] }, include: [{
                    model: User, as: 'Bidder', order: [['bid_amount', 'DESC']], attributes: { exclude: ['createdAt', 'updatedAt', 'password', 'email', 'admin'] }
                }]
            });

            doc.text('Auction Biddings', { align: 'center' }).moveDown(2);

            const table = new (require('voilab-pdf-table'))(doc, { bottomMargin: 30 });
            table
                // add some plugins (here, a 'fit-to-width' for a column)
                .addPlugin(new (require('voilab-pdf-table/plugins/fitcolumn'))({
                    column: 'name'
                })).setColumnsDefaults({
                    align: 'left'
                })
                .addColumns([{ id: 'name', header: 'Name', align: 'left' }, { id: 'amount', header: 'Amount', align: 'left' }])
            const tableData = details.map((detail, index) => {
                if (index === 0) {
                    return {
                        name: `WINNER (${detail.Bidder.username})`,
                        amount: detail.bid_amount
                    }
                } else {
                    return {
                        name: detail.Bidder.username,
                        amount: detail.bid_amount
                    };
                }
            });

            table.addBody(tableData);
            doc.moveDown();

            doc.end();

            // Wait for the PDF to finish writing before sending the response
            await new Promise(resolve => {
                doc.on('end', resolve);
            });

            console.log('Pdf created successfully');
            job.stop();
        };
    },
    null,
    false
);




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
                                ended_at: Date.now() + 1800000
                            });
                            job.id = find.id;
                            job.start();
                            return res.status(200).json({ 'status': 'success', 'message': 'Auction Started and ends in next 30 minutes' })
                        } else {
                            return res.status(400).json({ 'status': 'failed', 'message': 'Item Already in Live Auction' })
                        }
                    } else {
                        return res.status(400).json({ 'status': 'failed', 'message': 'Item Already Sold Out' })
                    }
                } else {
                    const auction = await Auction.create({
                        item_id: findItem.id,
                        bid_amount: findItem.base_price,
                        started_at: Date.now(),
                        ended_at: Date.now() + 1800000
                    });
                    job.id = auction.id;
                    job.start();
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
            if (Number(bid) <= Number(auction.bid_amount)) {
                return res.status(400).json({ 'status': 'failed', 'message': 'Increase Bid Amount' })
            } else {
                const checkHignestBid = await Bid.findOne({
                    where: { auction_id: id },
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




};


// async function getDistanceByRoad(startLat, startLon, endLat, endLon) {
//     const apiKey = '5b3ce3597851110001cf6248dc78b050ba5f4435aa610960c2b1482c';
//     const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startLon},${startLat}&end=${endLon},${endLat}`;

//     try {
//         const response = await axios.get(url);
//         const distance = response.data.features[0].properties.segments[0].distance / 1000;
//         console.log(distance);
//     } catch (error) {
//         console.log(error);
//     }
// };


// getDistanceByRoad(30.70878, 76.83979, 30.65967, 76.82189); // Replace the coordinates with your own
