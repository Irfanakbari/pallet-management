import checkCookieMiddleware from "@/pages/api/middleware";
import {Op} from "sequelize";
import TempHistory from "@/models/TempHistoryUser";
import logger from "@/utils/logger";

async function handler(req, res) {
	switch (req.method) {
		case 'GET':
			if (req.user.role !== 'operator') {
				return res.status(401).json({
					ok: false,
					data: "Role must be Operator"
				});
			}
			try {
				const today = new Date();
				today.setHours(0, 0, 0, 0); // Set jam menjadi 00:00:00.000

				const tomorrow = new Date(today);
				tomorrow.setDate(tomorrow.getDate() + 1); // Mendapatkan tanggal besok (00:00:00.000)

				let histories;

				histories = await TempHistory.findAll({
					where: {
						operator: req.user.username,
						timestamp: {
							[Op.between]: [today, tomorrow]
						}
					}
				})

				const formattedHistories = histories.map((history) => {
					const timestamp = new Date(history.timestamp);
					const formattedTimestamp = `${String(timestamp.getHours()).padStart(2, '0')}:${String(
						timestamp.getMinutes()
					).padStart(2, '0')}:${String(timestamp.getSeconds()).padStart(2, '0')}`;
					return {...history.toJSON(), timestamp: formattedTimestamp};
				});

				res.status(200).json({
					ok: true,
					data: formattedHistories,
				});

			} catch (e) {
				logger.error({
					message: e.message,
					path: req.url, // Add the path as metadata
				});
				res.status(500).json({
					ok: false,
					data: "Internal Server Error",
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
