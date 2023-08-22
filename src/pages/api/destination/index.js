import checkCookieMiddleware from "@/pages/api/middleware";
import Part from "@/models/Part";
import {Op} from "sequelize";
import logger from "@/utils/logger";
import Destination from "@/models/Destination";
import Vehicle from "@/models/Vehicle";

async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            if (req.user.role === 'operator') {
                return res.status(401).json({
                    ok: false,
                    data: "Operator Tidak Boleh Mengakses Halaman Ini"
                });
            }
            try {
                let destinatios
                if (req.user.role === 'super') {
                    // Jika user memiliki role 'super', tampilkan semua data Part tanpa batasan departemen
                    destinatios = await Destination.findAll({
                        include:[
                            {
                                model: Part,
                                attributes:['name']
                            }
                        ]
                    });
                } else if (req.user.role === 'admin' || req.user.role === 'viewer') {
                    // Jika user memiliki role 'admin', tampilkan data Part dengan departemen yang sesuai
                    const allowedDepartments = req.department.map((department) => department.department_id);

                    destinatios = await Destination.findAll({
                        where: {
                            '$department$': { [Op.in]: allowedDepartments }
                        },
                        include: [
                            {
                                model: Part,
                                include: [
                                    {
                                        model: Vehicle,
                                    }
                                ]
                            },
                        ]
                    });
                }

                res.status(200).json({
                    ok: true,
                    data: destinatios
                });
            } catch (e) {
                logger.error(e.message);
                res.status(500).json({
                    ok: false,
                    data: "Internal Server Error"
                });
            }
            break;
        case 'POST':
            if (req.user.role !== 'super' && req.user.role !== 'admin') {
                return res.status(401).json({
                    ok: false,
                    data: "Role must be admin"
                });
            }
            try {
                const { name, part } = req.body;
                await Destination.create({
                    name: name,
                    part: part
                });
                res.status(200).json({ success: true });
            } catch (error) {
                logger.error(error.message);
                res.status(500).json({ success: false, error: error.message });
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
