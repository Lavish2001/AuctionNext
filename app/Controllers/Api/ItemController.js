const { Op } = require("sequelize");
const { Item } = model("");
const { Auction } = model("");
const { checkAdmin, upload } = helper("Helper");


module.exports = class ItemController {




    // CREATE AUCTION ITEM //

    async createItem(req, res) {

        try {
            upload(req, res, async (err) => {
                if (err) {
                    return res.status(400).json({ 'status': 'failed', 'message': err.message })
                } else {
                    const { description, item_name, start_price, item_id } = req.body;
                    if (req.file && description && item_name && start_price && item_id) {
                        const find = await Item.findOne({ where: { item_id: req.body.item_id } });
                        if (find) {
                            res.status(400).json({ 'status': 'failed', 'message': 'Item already already exists' })
                        } else {
                            try {
                                await checkAdmin(req.user, req, res);
                                await Item.create({
                                    item_name: item_name,
                                    item_id: item_id,
                                    description: description,
                                    user_id: req.user.id,
                                    base_price: start_price,
                                    image: req.file.filename
                                });
                                return res.status(200).redirect('/welcome');
                            } catch (err) {
                                return res.status(500).json({ 'status': 'failed', 'message': err.message })
                            }
                        }
                    } else {
                        return res.status(400).json({ 'status': 'failed', 'message': 'All fields required' })
                    }
                }
            })
        } catch (err) {
            return res.status(500).json({ 'status': 'failed', 'message': err.message })
        }

    };




    // GET ALL ITEMS WITH PAGINATION //

    async getAllItem(req, res) {
        try {
            let page;
            if (!req.query.number || req.query.number == 0) {
                page = 1;
            } else {
                page = Number(req.query.number)
            }
            let auction_items = await Auction.findAll({ where: { bidder_id: { [Op.ne]: null } }, attributes: { include: ['item_id'] } });
            let itemId = auction_items.map((item) => { return item.item_id });
            let items = await Item.findAll({ where: { id: { [Op.notIn]: itemId } } });
            let sorted = items.sort((a, b) => { return a.createdAt > b.createdAt ? -1 : 1 })
            let num = 2;
            const data = sorted.slice((page - 1) * num, page * num);
            let arr = [];
            let divide;
            if ((sorted.length) % num == 0) {
                divide = (sorted.length) / num
            } else {
                divide = ((sorted.length) / num) + 1
            }
            for (let i = 1; i <= divide; i++) {
                arr.push(i)
            };
            return res.status(200).json({ 'status': 'success', 'data': data, 'page': arr })
        } catch (err) {
            return res.status(500).json({ 'status': 'failed', 'message': err.message })
        }
    }





    // GET ALL ITEMS //

    async getAllItemOnce(req, res) {
        try {
            let items = await Item.findAll({ attributes: ['item_id'] });
            return res.status(200).json({ 'status': 'success', 'data': items })
        } catch (err) {
            return res.status(500).json({ 'status': 'failed', 'message': err.message })
        }
    }


};
