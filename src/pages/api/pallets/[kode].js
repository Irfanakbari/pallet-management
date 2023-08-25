import Pallet from "@/models/Pallet";
import checkCookieMiddleware from "@/pages/api/middleware";
import logger from "@/utils/logger";
import connection from "@/config/database";
import History from "@/models/History";

async function handler(req, res) {
	switch (req.method) {
		case 'DELETE':
			if (req.user.role !== 'super' && req.user.role !== 'admin') {
				return res.status(401).json({
					ok: false,
					data: "Role must be admin"
				});
			}
			try {
				const idPallet = req.query.kode; // Anggap req.body.id berisi ID pelanggan yang akan dihapus
				await connection.transaction(async t => {
					await Pallet.destroy({
						where: {
							kode: idPallet
						}
					}, {transaction: t});
					await History.destroy({
						where: {
							id_pallet: idPallet
						}
					}, {transaction: t});
				})
				res.status(200).json({
					ok: true,
					data: "Valet deleted successfully"
				});
			} catch (e) {
				logger.error({
					message: e.message,
					path: req.url, // Add the path as metadata
				});
				res.status(500).json({
					ok: false,
					data: "Internal Server Error"
				});
			}
			break;
		case 'PUT':
			if (req.user.role !== 'super' && req.user.role !== 'admin') {
				return res.status(401).json({
					ok: false,
					data: "Role must be admin"
				});
			}
			try {
				const palletId = req.query.kode; // Anggap req.body.id berisi ID pelanggan yang akan dihapus
				const {name} = req.body; // Anggap req.body berisi data pelanggan baru
				await Pallet.update({
					name
				}, {
					where: {
						kode: palletId
					}
				});
				res.status(201).json({
					ok: true,
					data: "Success"
				});
			} catch (e) {
				logger.error({
					message: e.message,
					path: req.url, // Add the path as metadata
				});
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