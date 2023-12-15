import Pallet from "@/models/Pallet";
import checkCookieMiddleware from "@/pages/api/middleware";

import connection from "@/config/database";
import History from "@/models/History";

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
				const palletId = req.query.kode; // Anggap req.body.id berisi ID pelanggan yang akan dihapus
				await Pallet.update({
					printed_at: new Date()
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