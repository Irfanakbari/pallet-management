import Pallet from "@/models/Pallet";
import checkCookieMiddleware from "@/pages/api/middleware";
import Customer from "@/models/Customer";
import History from "@/models/History";
import {Op} from "sequelize";
import moment from "moment";
import Part from "@/models/Part";
import logger from "@/utils/logger";
import Vehicle from "@/models/Vehicle";
async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            if (req.user.role !== 'super' && req.user.role !== 'admin') {
                return res.status(401).json({
                    ok: false,
                    data: "Role must be admin"
                });
            }
            try {
                const customer = req.query.customer;
                let datas;
                if (req.user.role === 'super') {
                    datas = await History.findAll({
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
                                    },
                                ]
                            }
                        ],
                    });
                } else {
                    const allowedDepartments = req.department.map((department) => department.department_id);
                    datas = await History.findAll({
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
                                    },
                                    {
                                        model: Vehicle,
                                        where: {
                                            department: { [Op.in]: allowedDepartments }, // Filter berdasarkan department_id
                                        },
                                    }
                                ]
                            }
                        ],
                    });
                }
                res.status(200).json({
                    data : datas
                });
            } catch (error) {
                logger.error(e.message);
                res.status(500).json({ error: 'Internal Server Error' });
            }
            break;
        default:
            res.status(405).json({
                ok: false,
                data: "Method Not Allowed"
            });
    }
}

const protectedAPIHandler = checkCookieMiddleware(handler);
export default protectedAPIHandler;
