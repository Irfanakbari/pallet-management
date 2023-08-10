import Pallet from "@/models/Pallet";
import checkCookieMiddleware from "@/pages/api/middleware";
import Customer from "@/models/Customer";
import History from "@/models/History";
import {Op} from "sequelize";
import moment from "moment";
import Part from "@/models/Part";


async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            try {
                if (req.user.role !== 'super' && req.user.role !== 'admin') {
                    return res.status(401).json({
                        ok: false,
                        data: "Role must be admin"
                    });
                }
                const customer = req.query.customer;
                const datas = await History.findAll({
                    where: {
                        keluar: {
                            [Op.lt]: moment().subtract(1, 'week').toDate(),
                        },
                        masuk: null
                    },
                    attributes: ['id_pallet'],
                    include: [
                        {
                            model: Pallet,
                            where: {
                                status: 0,
                            },
                            attributes: ['updated_at','part','name'],
                            include: [
                                {
                                    model: Customer,
                                    where: {
                                        name: customer
                                    }
                                },
                                {
                                    model: Part,
                                    attributes: ['name']
                                }
                            ]
                        }
                    ],
                });
                res.status(200).json({
                    data : datas
                });
            } catch (error) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
            break;
    }
}
const protectedAPIHandler = checkCookieMiddleware(handler);


export default protectedAPIHandler;
