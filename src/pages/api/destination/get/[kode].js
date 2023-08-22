import checkCookieMiddleware from "@/pages/api/middleware";
import Part from "@/models/Part";
import {Op} from "sequelize";
import logger from "@/utils/logger";
import Destination from "@/models/Destination";
import Vehicle from "@/models/Vehicle";
import Pallet from "@/models/Pallet";

async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            if (req.user.role !== 'operator') {
                return res.status(401).json({
                    ok: false,
                    data: "Hanya Operator Yang Boleh Mengakses Halaman Ini"
                });
            }
            try {
                const kode = req.query.kode;
                const pallet = await Pallet.findByPk(kode)
                let destinations;
                destinations = await Destination.findAll({
                    where: {
                        part: pallet.dataValues.part
                    }
                });

                res.status(200).json({
                    ok: true,
                    data: destinations
                });
            } catch (e) {
                logger.error(e.message);
                res.status(500).json({
                    ok: false,
                    data: "Internal Server Error"
                });
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
