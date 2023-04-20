const { Op } = require("sequelize");
const { Location } = model("");
const { findNearbyCompanies } = helper("Helper");
const { repeatFunction } = helper("Helper");
const { Sequelize } = require('../../Models/index');



module.exports = class LocationController {




    // CREATE COMPANY AND INSERT LOCATION //

    async createLocation(req, res) {

        try {
            const { companyName, companyAddress, longitude, latitude } = req.body;
            if (companyName && companyAddress && longitude && latitude) {
                const createLocation = await Location.create({
                    company_name: companyName,
                    company_address: companyAddress,
                    longitude: longitude,
                    latitude: latitude
                });
                return res.status(200).json({ 'status': 'success', 'message': 'sucessfully created' })
            } else {
                return res.status(400).json({ 'status': 'failed', 'message': 'ERROR' })
            }
        } catch (err) {
            return res.status(500).json({ 'status': 'failed', 'message': err.message })
        }

    };




    // GET NEARBY COMPANY //

    async getNearby(req, res) {

        try {
            const { id, km } = req.query;
            if (id) {
                const company = await Location.findOne({ where: { id: id }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
                if (company) {
                    const distance = await findNearbyCompanies(company.latitude, company.longitude);
                    const companies = await Location.findAll({
                        attributes: {
                            include: [
                                [distance, 'distance'],
                            ], exclude: ['createdAt', 'updatedAt']
                        },
                        where: { [Op.and]: [Sequelize.where(distance, '<=', km), { id: { [Op.ne]: id } }] },
                        order: Sequelize.col('distance'),
                    });

                    const data = await repeatFunction(company.latitude, company.longitude, companies);


                    return res.status(200).json({ 'status': 'success', 'Your Company': company, 'Near By Companies': data })
                }
            }
            return res.status(400).json({ 'status': 'failed', 'message': 'ERROR' })
        } catch (err) {
            return res.status(500).json({ 'status': 'failed', 'message': err.message })
        }

    };




};
