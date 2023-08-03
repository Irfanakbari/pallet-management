import checkCookieMiddleware from "@/pages/api/middleware";
import {Op} from "sequelize";
import TempHistory from "@/models/TempHistoryUser";

async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            try {
                if (req.user.role !== 'operator') {
                    return res.status(401).json({
                        ok: false,
                        data: "Role must be Operator"
                    });
                }
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set jam menjadi 00:00:00.000

                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1); // Mendapatkan tanggal besok (00:00:00.000)

                let histories;
                let whereClause = {}; // Inisialisasi objek kosong untuk kondisi where

                histories = await TempHistory.findAll({
                    where: {
                        operator: req.user.username,
                        timestamp: {
                            [Op.between]: [today, tomorrow]
                        }
                    }
                })

                res.status(200).json({
                    ok: true,
                    data: histories,
                });
            } catch (e) {
                res.status(500).json({
                    ok: false,
                    data: "Internal Server Error",
                });
            }
            break;
    }
}

const protectedAPIHandler = checkCookieMiddleware(handler);

export default protectedAPIHandler;
